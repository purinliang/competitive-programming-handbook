import { createHash } from "node:crypto";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import GithubSlugger from "github-slugger";
import { toText } from "hast-util-to-text";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const appRoot = process.cwd();
const notesRoot = path.resolve(appRoot, "../../notes");
const cacheRoot = path.join(appRoot, ".content-cache");
const articleCacheRoot = path.join(cacheRoot, "articles");
const searchIndexPath = path.join(appRoot, "public/search-index.json");
const articleStatuses = new Set(["计划", "待审阅", "已审阅", "草稿", "定稿"]);

function extractMarkdownPath(cell) {
  return cell.match(/\]\(([^)]+\.md)(?:#[^)]+)?\)/)?.[1] ?? cell.match(/`([^`]+\.md)`/)?.[1];
}

function toArticleKey(sourcePath) {
  return sourcePath.replace(/\\/g, "/").replace(/\.md$/, "");
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function parseCatalog() {
  const catalog = await readFile(path.join(notesRoot, "CATALOG.md"), "utf8");
  const articles = [];
  let moduleKey = "";
  let moduleTitle = "";
  let moduleAnchor = "";
  const moduleSlugger = new GithubSlugger();

  for (const line of catalog.split("\n")) {
    const moduleMatch = line.match(/^##\s+(\d+\s+.+)$/);
    if (moduleMatch) {
      moduleTitle = moduleMatch[1].trim();
      moduleAnchor = moduleSlugger.slug(moduleMatch[1].trim());
      moduleKey = "";
      continue;
    }

    if (!/^\|\s*\d/.test(line)) {
      continue;
    }

    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length !== 4) {
      continue;
    }

    const [catalogId, title, status, fileCell] = cells;
    const sourcePath = extractMarkdownPath(fileCell);
    if (!sourcePath || !articleStatuses.has(status)) {
      continue;
    }

    const articleKey = toArticleKey(sourcePath);
    const pathParts = articleKey.split("/");
    moduleKey ||= pathParts[0];
    articles.push({
      articleKey,
      articleSlug: pathParts.at(-1) ?? articleKey,
      catalogId,
      title,
      status,
      kind: catalogId.includes("*") || catalogId.includes("e") ? "extension" : "core",
      moduleKey,
      moduleTitle,
      moduleAnchor,
      sourcePath,
      route: `/${articleKey}/`,
      exists: await fileExists(path.join(notesRoot, sourcePath)),
    });
  }

  const duplicateKeys = articles.filter(
    (article, index) => articles.findIndex((candidate) => candidate.articleKey === article.articleKey) !== index,
  );
  if (duplicateKeys.length > 0) {
    throw new Error(`CATALOG.md 中存在重复 article_key：${duplicateKeys.map((item) => item.articleKey).join(", ")}`);
  }

  return articles;
}

async function parseLearningStages() {
  const learningPath = await readFile(path.join(notesRoot, "LEARNING-PATH.md"), "utf8");
  const stages = [];
  let currentStage;
  let currentUnit;

  for (const line of learningPath.split("\n")) {
    const stageMatch = line.match(/^##\s+(\d{2})\s+(.+)$/);
    if (stageMatch) {
      currentStage = {
        key: `stage-${stageMatch[1]}`,
        number: stageMatch[1],
        title: stageMatch[2].trim(),
        articleKeys: [],
        units: [],
      };
      stages.push(currentStage);
      currentUnit = undefined;
      continue;
    }

    if (/^##\s+/.test(line)) {
      currentStage = undefined;
      currentUnit = undefined;
      continue;
    }

    const unitMatch = line.match(/^###\s+学习单元：(.+)$/);
    if (currentStage && unitMatch) {
      currentUnit = { title: unitMatch[1].trim(), articleKeys: [] };
      currentStage.units.push(currentUnit);
      continue;
    }

    if (!currentStage || !/^\|\s*\d/.test(line)) {
      continue;
    }

    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    const sourcePath = cells.length === 4 ? extractMarkdownPath(cells[3]) : undefined;
    if (sourcePath) {
      const articleKey = toArticleKey(sourcePath);
      currentStage.articleKeys.push(articleKey);
      currentUnit?.articleKeys.push(articleKey);
    }
  }

  for (const stage of stages) {
    const emptyUnits = stage.units.filter((unit) => unit.articleKeys.length === 0);
    if (emptyUnits.length > 0) {
      throw new Error(`${stage.title} 中存在空学习单元：${emptyUnits.map((unit) => unit.title).join(", ")}`);
    }
    if (stage.units.length > 0) {
      const unitArticleKeys = stage.units.flatMap((unit) => unit.articleKeys);
      if (unitArticleKeys.join("\n") !== stage.articleKeys.join("\n")) {
        throw new Error(`${stage.title} 的学习单元没有按顺序完整覆盖本阶段文章`);
      }
    }
  }

  return stages;
}

function walkTree(node, visitor, parent) {
  visitor(node, parent);
  for (const child of node.children ?? []) {
    walkTree(child, visitor, node);
  }
}

function rewriteUrl(url, sourcePath) {
  if (/^(?:[a-z]+:|\/|#)/i.test(url)) {
    return url;
  }

  const [pathname, hash] = url.split("#", 2);
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), pathname));
  const suffix = hash ? `#${hash}` : "";

  if (resolved === "CATALOG.md") {
    return `/catalog/${suffix}`;
  }
  if (resolved === "LEARNING-PATH.md") {
    return hash === "扩展阅读索引" ? "/catalog/" : `/learn/${suffix}`;
  }
  if (resolved.startsWith("assets/")) {
    return `/content-assets/${resolved.slice("assets/".length)}${suffix}`;
  }
  if (resolved.endsWith(".md")) {
    return `/${resolved.slice(0, -3)}/${suffix}`;
  }

  return url;
}

function remarkRewriteLinks(sourcePath) {
  return () => (tree) => {
    walkTree(tree, (node) => {
      if ((node.type === "link" || node.type === "image") && node.url) {
        node.url = rewriteUrl(node.url, sourcePath);
      }
    });
  };
}

function rehypeCollectMetadata(tableOfContents) {
  return () => (tree) => {
    let currentSection = "article";
    const occurrences = new Map();

    walkTree(tree, (node, parent) => {
      if (node.type !== "element" || !node.tagName) {
        return;
      }

      node.properties ??= {};
      if (node.tagName === "h2" || node.tagName === "h3") {
        const id = String(node.properties.id ?? "");
        const title = toText(node);
        if (id) {
          tableOfContents.push({ depth: node.tagName === "h2" ? 2 : 3, id, title });
          currentSection = id;
          node.properties["data-block-key"] = `heading:${id}`;
        }
        return;
      }

      if (!["p", "pre", "table", "blockquote", "li"].includes(node.tagName)) {
        return;
      }
      if (node.tagName === "p" && (parent?.tagName === "blockquote" || parent?.tagName === "li")) {
        return;
      }

      const normalizedText = toText(node).replace(/\s+/g, " ").trim();
      if (!normalizedText) {
        return;
      }

      const digest = createHash("sha256").update(normalizedText).digest("hex").slice(0, 12);
      const baseKey = `${currentSection}:${node.tagName}:${digest}`;
      const occurrence = (occurrences.get(baseKey) ?? 0) + 1;
      occurrences.set(baseKey, occurrence);
      node.properties["data-block-key"] = occurrence === 1 ? baseKey : `${baseKey}:${occurrence}`;
    });
  };
}

async function renderArticle(article) {
  const markdown = await readFile(path.join(notesRoot, article.sourcePath), "utf8");
  const tableOfContents = [];
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRewriteLinks(article.sourcePath))
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeCollectMetadata(tableOfContents))
    .use(rehypeKatex)
    .use(rehypePrettyCode, {
      theme: {
        light: "github-light-default",
        dark: "github-dark-default",
      },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(markdown);

  return {
    html: String(result),
    contentRevision: createHash("sha256").update(markdown).digest("hex").slice(0, 16),
    tableOfContents,
  };
}

function searchableText(markdown, articleTitles) {
  return markdown
    .replace(/^>\s*(?:最近修订|状态)：.*$/gm, "")
    .replace(/^##\s+(?:上一篇|下一篇|返回[^\n]*)\s*$[\s\S]*$/gm, "")
    .replace(/(?:上一篇|下一篇|返回基础篇)/g, " ")
    .replace(/```[^\n]*\n?/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, (_, label) => articleTitles.has(label.trim()) ? " " : label)
    .replace(/[`*_>#|$\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

await rm(cacheRoot, { force: true, recursive: true });
await mkdir(articleCacheRoot, { recursive: true });

const [articles, stages] = await Promise.all([parseCatalog(), parseLearningStages()]);
await writeFile(path.join(cacheRoot, "manifest.json"), `${JSON.stringify({ articles, stages })}\n`);

const publishedArticles = articles.filter((article) => article.exists && article.status !== "计划");
const articleTitles = new Set(publishedArticles.map((article) => article.title));
const searchRecords = [];

for (const article of publishedArticles) {
  const markdown = await readFile(path.join(notesRoot, article.sourcePath), "utf8");
  const rendered = await renderArticle(article);
  const outputPath = path.join(articleCacheRoot, `${article.articleKey}.json`);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(rendered)}\n`);
  searchRecords.push({
    articleKey: article.articleKey,
    title: article.title,
    moduleTitle: article.moduleTitle,
    route: article.route,
    status: article.status,
    text: searchableText(markdown, articleTitles),
  });
}

await mkdir(path.dirname(searchIndexPath), { recursive: true });
await writeFile(searchIndexPath, `${JSON.stringify(searchRecords)}\n`);

console.log(`已预编译 ${publishedArticles.length} 篇文章。`);
