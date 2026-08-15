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
const quizCacheRoot = path.join(cacheRoot, "quizzes");
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
  const catalog = await readFile(path.join(notesRoot, "catalog.md"), "utf8");
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
      learningSourcePath: sourcePath,
      catalogRoute: `/catalog/${articleKey}/`,
      learningPathRoute: `/learning-path/${articleKey}/`,
      exists: await fileExists(path.join(notesRoot, sourcePath)),
    });
  }

  const duplicateKeys = articles.filter(
    (article, index) => articles.findIndex((candidate) => candidate.articleKey === article.articleKey) !== index,
  );
  if (duplicateKeys.length > 0) {
    throw new Error(`catalog.md 中存在重复 article_key：${duplicateKeys.map((item) => item.articleKey).join(", ")}`);
  }

  return articles;
}

async function parseLearningStages() {
  const learningPath = await readFile(path.join(notesRoot, "learning-path.md"), "utf8");
  const stages = [];
  let currentStage;
  let currentUnit;
  const sourcePaths = new Map();

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
      const sourceKey = toArticleKey(sourcePath);
      const articleKey = sourceKey.startsWith("learning-path/") ? sourceKey.slice("learning-path/".length) : sourceKey;
      sourcePaths.set(articleKey, sourcePath);
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

  return { sourcePaths, stages };
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

  if (resolved === "catalog.md") {
    return `/catalog/${suffix}`;
  }
  if (resolved === "learning-path.md") {
    return hash === "扩展阅读索引" ? "/catalog/" : `/learning-path/${suffix}`;
  }
  if (resolved.startsWith("assets/")) {
    return `/content-assets/${resolved.slice("assets/".length)}${suffix}`;
  }
  if (resolved.endsWith(".md")) {
    return `/catalog/${resolved.slice(0, -3)}/${suffix}`;
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

async function renderArticle(article, sourcePath) {
  const markdown = await readFile(path.join(notesRoot, sourcePath), "utf8");
  const tableOfContents = [];
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRewriteLinks(sourcePath))
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

async function compileLearningQuiz(articleKey) {
  const sourcePath = path.join(notesRoot, "learning-path", `${articleKey}.quiz.json`);
  if (!(await fileExists(sourcePath))) {
    return;
  }

  const source = await readFile(sourcePath, "utf8");
  const questions = JSON.parse(source);
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error(`${path.relative(notesRoot, sourcePath)} 必须包含至少一道题`);
  }

  const questionIds = new Set();
  for (const question of questions) {
    if (!question || typeof question.id !== "string" || !question.id || questionIds.has(question.id)) {
      throw new Error(`${path.relative(notesRoot, sourcePath)} 包含缺失或重复的题目 id`);
    }
    questionIds.add(question.id);
    if (typeof question.prompt !== "string" || !question.prompt.trim()) {
      throw new Error(`${path.relative(notesRoot, sourcePath)} 的 ${question.id} 缺少题干`);
    }
    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw new Error(`${path.relative(notesRoot, sourcePath)} 的 ${question.id} 至少需要两个选项`);
    }
    const optionIds = new Set(question.options.map((option) => option?.id));
    if (optionIds.size !== question.options.length || [...optionIds].some((id) => typeof id !== "string" || !id)) {
      throw new Error(`${path.relative(notesRoot, sourcePath)} 的 ${question.id} 包含缺失或重复的选项 id`);
    }
    if (!optionIds.has(question.correctOptionId)) {
      throw new Error(`${path.relative(notesRoot, sourcePath)} 的 ${question.id} 正确答案不在选项中`);
    }
    if (typeof question.explanation !== "string" || !question.explanation.trim()) {
      throw new Error(`${path.relative(notesRoot, sourcePath)} 的 ${question.id} 缺少解析`);
    }
  }

  const outputPath = path.join(quizCacheRoot, `${articleKey}.json`);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify({
    revision: createHash("sha256").update(source).digest("hex").slice(0, 16),
    questions,
  })}\n`);
}

await rm(cacheRoot, { force: true, recursive: true });
await mkdir(articleCacheRoot, { recursive: true });
await mkdir(quizCacheRoot, { recursive: true });

const [articles, learningPath] = await Promise.all([parseCatalog(), parseLearningStages()]);
const { sourcePaths: learningSourcePaths, stages } = learningPath;
const articlesByKey = new Map(articles.map((article) => [article.articleKey, article]));
for (const [articleKey, sourcePath] of learningSourcePaths) {
  const article = articlesByKey.get(articleKey);
  if (!article) {
    throw new Error(`learning-path.md 中的学习正文没有对应目录条目：${sourcePath}`);
  }
  if (article.status !== "计划" && !(await fileExists(path.join(notesRoot, sourcePath)))) {
    throw new Error(`learning-path.md 中的学习正文不存在：${sourcePath}`);
  }
}
for (const article of articles) {
  article.learningSourcePath = learningSourcePaths.get(article.articleKey) ?? article.sourcePath;
}
await writeFile(path.join(cacheRoot, "manifest.json"), `${JSON.stringify({ articles, stages })}\n`);

const publishedArticles = articles.filter((article) => article.exists && article.status !== "计划");
const learningArticleKeys = new Set(stages.flatMap((stage) => stage.articleKeys));
const articleTitles = new Set(publishedArticles.map((article) => article.title));
const searchRecords = [];

for (const article of publishedArticles) {
  const markdown = await readFile(path.join(notesRoot, article.sourcePath), "utf8");
  const catalogRendered = await renderArticle(article, article.sourcePath);
  const learningRendered = article.learningSourcePath === article.sourcePath
    ? catalogRendered
    : await renderArticle(article, article.learningSourcePath);
  const catalogOutputPath = path.join(articleCacheRoot, "catalog", `${article.articleKey}.json`);
  const learningOutputPath = path.join(articleCacheRoot, "learning-path", `${article.articleKey}.json`);
  await mkdir(path.dirname(catalogOutputPath), { recursive: true });
  await mkdir(path.dirname(learningOutputPath), { recursive: true });
  await writeFile(catalogOutputPath, `${JSON.stringify(catalogRendered)}\n`);
  await writeFile(learningOutputPath, `${JSON.stringify(learningRendered)}\n`);
  searchRecords.push({
    articleKey: article.articleKey,
    title: article.title,
    moduleTitle: article.moduleTitle,
    route: article.catalogRoute,
    status: article.status,
    text: searchableText(markdown, articleTitles),
  });
}

await Promise.all([...learningArticleKeys].map((articleKey) => compileLearningQuiz(articleKey)));

await mkdir(path.dirname(searchIndexPath), { recursive: true });
await writeFile(searchIndexPath, `${JSON.stringify(searchRecords)}\n`);

console.log(`已预编译 ${publishedArticles.length} 篇文章。`);
