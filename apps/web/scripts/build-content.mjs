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

import {
  extractDocumentEpoch,
  extractArticleSections,
  hashRevision,
  questionRevision,
} from "./content-identity.mjs";

const appRoot = process.cwd();
const notesRoot = path.resolve(appRoot, "../../notes");
const cacheRoot = path.join(appRoot, ".content-cache");
const articleCacheRoot = path.join(cacheRoot, "articles");
const quizCacheRoot = path.join(cacheRoot, "quizzes");
const buildStatePath = path.join(cacheRoot, "build-state.json");
const searchIndexPath = path.join(appRoot, "public/search-index.json");
const learningProgressPath = path.join(appRoot, "public/learning-progress.json");
const articleStatuses = new Set(["计划", "待审阅", "已审阅", "草稿", "定稿"]);
const arguments_ = new Set(process.argv.slice(2));
const unknownArguments = [...arguments_].filter(
  (argument) => argument !== "--full" && argument !== "--incremental",
);
if (unknownArguments.length > 0 || (arguments_.has("--full") && arguments_.has("--incremental"))) {
  throw new Error("用法：node scripts/build-content.mjs [--incremental|--full]");
}
const fullBuild = arguments_.has("--full");

function hashParts(...parts) {
  const hash = createHash("sha256");
  for (const part of parts) {
    hash.update(String(part.length));
    hash.update(":");
    hash.update(part);
  }
  return hash.digest("hex");
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return;
  }
}

async function contentCompilerRevision() {
  const sources = await Promise.all([
    readFile(new URL(import.meta.url), "utf8"),
    readFile(new URL("./content-identity.mjs", import.meta.url), "utf8"),
    readFile(path.join(appRoot, "package.json"), "utf8"),
    readFile(path.join(appRoot, "pnpm-lock.yaml"), "utf8"),
  ]);
  return hashParts("content-compiler-v1", ...sources);
}

function extractMarkdownPath(cell) {
  return cell.match(/\]\(([^)]+\.md)(?:#[^)]+)?\)/)?.[1] ?? cell.match(/`([^`]+\.md)`/)?.[1];
}

function toArticleKey(sourcePath) {
  return sourcePath.replace(/\\/g, "/").replace(/\.md$/, "");
}

function navigationKey(...parts) {
  return createHash("sha256").update(parts.join("\0")).digest("hex").slice(0, 12);
}

const catalogModuleKeys = {
  "01": "cpp",
  "02": "algorithm-basics",
  "03": "data-structures",
  "04": "graph-theory",
  "05": "math",
  "06": "computational-geometry",
  "07": "dynamic-programming",
  "08": "strings",
  "09": "other",
};

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
  const articles = new Map();
  const modules = new Map();
  let moduleKey = "";
  let moduleTitle = "";
  let moduleAnchor = "";
  let catalogAreaTitle;
  let catalogTopicTitle;
  let catalogPosition = 0;
  const moduleSlugger = new GithubSlugger();

  for (const line of catalog.split("\n")) {
    const moduleMatch = line.match(/^##\s+(\d+\s+.+)$/);
    if (moduleMatch) {
      moduleTitle = moduleMatch[1].trim();
      moduleAnchor = moduleSlugger.slug(moduleMatch[1].trim());
      moduleKey = catalogModuleKeys[moduleTitle.slice(0, 2)] ?? "";
      if (!moduleKey) {
        throw new Error(`catalog.md 中的模块 ${moduleTitle} 没有稳定路由键`);
      }
      catalogAreaTitle = undefined;
      catalogTopicTitle = undefined;
      continue;
    }

    const areaMatch = line.match(/^###\s+(?!专题：)(.+)$/);
    if (areaMatch) {
      catalogAreaTitle = areaMatch[1].trim();
      catalogTopicTitle = undefined;
      continue;
    }

    const legacyTopicMatch = line.match(/^###\s+专题：(.+)$/);
    if (legacyTopicMatch) {
      catalogAreaTitle = legacyTopicMatch[1].trim();
      catalogTopicTitle = undefined;
      continue;
    }

    const topicMatch = line.match(/^####\s+专题：(.+)$/);
    if (topicMatch) {
      catalogTopicTitle = topicMatch[1].trim();
      continue;
    }

    if (!/^\|\s*\*?\d/.test(line)) {
      continue;
    }

    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length !== 4) {
      continue;
    }

    const [rawCatalogId, title, status, fileCell] = cells;
    const catalogId = rawCatalogId.replace(/^\*/, "");
    const sourcePath = extractMarkdownPath(fileCell);
    if (!sourcePath || !articleStatuses.has(status)) {
      continue;
    }

    const articleKey = toArticleKey(sourcePath);
    const pathParts = articleKey.split("/");
    modules.set(moduleKey, {
      key: moduleKey,
      title: moduleTitle,
      anchor: moduleAnchor,
    });

    const areaTitle = catalogAreaTitle ?? moduleTitle.replace(/^\d+\s+/, "");
    const areaKey = `catalog-${navigationKey(moduleKey, areaTitle)}`;
    const topicKey = catalogTopicTitle
      ? `catalog-${navigationKey(moduleKey, areaTitle, catalogTopicTitle)}`
      : undefined;
    const placement = {
      key: `catalog-${navigationKey(
        moduleKey,
        areaTitle,
        catalogTopicTitle ?? "",
        articleKey,
      )}`,
      moduleKey,
      moduleTitle,
      moduleAnchor,
      areaKey,
      areaTitle,
      areaPosition: catalogPosition,
      topicKey,
      topicTitle: catalogTopicTitle,
      topicPosition: catalogTopicTitle ? catalogPosition : undefined,
      position: catalogPosition,
    };
    catalogPosition += 1;

    const existing = articles.get(articleKey);
    if (existing) {
      if (
        existing.catalogId !== catalogId
        || existing.title !== title
        || existing.status !== status
        || existing.sourcePath !== sourcePath
      ) {
        throw new Error(`catalog.md 中重复条目 ${articleKey} 的元数据不一致`);
      }
      if (!existing.catalogPlacements.some((item) => item.key === placement.key)) {
        existing.catalogPlacements.push(placement);
      }
      continue;
    }

    const primaryModuleKey = pathParts[0];
    articles.set(articleKey, {
      articleKey,
      articleSlug: pathParts.at(-1) ?? articleKey,
      catalogId,
      title,
      learningTitle: title,
      catalogPlacements: [placement],
      status,
      kind: rawCatalogId.startsWith("*") ? "extension" : "core",
      moduleKey: primaryModuleKey,
      moduleTitle: "",
      moduleAnchor: "",
      sourcePath,
      learningSourcePath: sourcePath,
      catalogRoute: `/catalog/${articleKey}/`,
      learningPathRoute: `/learning-path/${articleKey}/`,
      exists: await fileExists(path.join(notesRoot, sourcePath)),
    });
  }

  return [...articles.values()].map((article) => {
    const primaryModule = modules.get(article.moduleKey)
      ?? article.catalogPlacements[0];
    return {
      ...article,
      moduleTitle: primaryModule.title ?? primaryModule.moduleTitle,
      moduleAnchor: primaryModule.anchor ?? primaryModule.moduleAnchor,
    };
  });
}

async function parseLearningStages() {
  const learningPath = await readFile(path.join(notesRoot, "learning-path.md"), "utf8");
  const stages = [];
  let currentStage;
  let currentUnit;
  const sourcePaths = new Map();
  const titles = new Map();

  for (const line of learningPath.split("\n")) {
    const stageMatch = line.match(/^##\s+(\d{2})\s+(.+)$/);
    if (stageMatch) {
      currentStage = {
        key: `stage-${stageMatch[1]}`,
        number: stageMatch[1],
        title: stageMatch[2].trim(),
        articleKeys: [],
        entryKeys: [],
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

    const unitMatch = line.match(/^###\s+单元\s+(\d{2})：(.+)$/);
    if (currentStage && unitMatch) {
      const number = unitMatch[1];
      const title = unitMatch[2].trim();
      const expectedNumber = String(currentStage.units.length + 1).padStart(2, "0");
      if (number !== expectedNumber) {
        throw new Error(`${currentStage.title} 的单元编号应为 ${expectedNumber}，实际为 ${number}`);
      }
      currentUnit = {
        key: `learning-${navigationKey(currentStage.key, number, title)}`,
        number,
        title,
        articleKeys: [],
        entryKeys: [],
      };
      currentStage.units.push(currentUnit);
      continue;
    }

    if (!currentStage || !/^\|\s*\*?\d/.test(line)) {
      continue;
    }

    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    const sourcePath = cells.length === 4 ? extractMarkdownPath(cells[3]) : undefined;
    if (sourcePath) {
      const sourceKey = toArticleKey(sourcePath);
      const articleKey = sourceKey.startsWith("learning-path/") ? sourceKey.slice("learning-path/".length) : sourceKey;
      const previousSourcePath = sourcePaths.get(articleKey);
      const previousTitle = titles.get(articleKey);
      if (previousSourcePath && previousSourcePath !== sourcePath) {
        throw new Error(`learning-path.md 中 ${articleKey} 的多个入口使用了不同正文`);
      }
      if (previousTitle && previousTitle !== cells[1]) {
        throw new Error(`learning-path.md 中 ${articleKey} 的多个入口使用了不同标题`);
      }
      sourcePaths.set(articleKey, sourcePath);
      titles.set(articleKey, cells[1]);
      const entryKey = currentUnit
        ? `${currentUnit.key}-${navigationKey(articleKey)}`
        : `learning-${navigationKey(currentStage.key, articleKey)}`;
      currentStage.articleKeys.push(articleKey);
      currentStage.entryKeys.push(entryKey);
      currentUnit?.articleKeys.push(articleKey);
      currentUnit?.entryKeys.push(entryKey);
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

  return { sourcePaths, stages, titles };
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
    if (sourcePath.startsWith("learning-path/") && resolved.startsWith("learning-path/")) {
      return `/learning-path/${resolved.slice("learning-path/".length, -3)}/${suffix}`;
    }
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

function rehypeCollectMetadata(tableOfContents, sections) {
  return () => (tree) => {
    let currentSection = "article";
    let currentSectionId = "article";
    let h2Index = 0;
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
          const section = node.tagName === "h2" ? sections[h2Index++] : undefined;
          if (section) {
            currentSectionId = section.id;
            node.properties["data-section-id"] = section.id;
            node.properties["data-section-revision"] = section.revision;
          }
          tableOfContents.push({
            depth: node.tagName === "h2" ? 2 : 3,
            id,
            sectionId: section?.id,
            sectionRevision: section?.revision,
            title,
          });
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
      node.properties["data-section-id"] = currentSectionId;
    });
  };
}

function rehypeSetArticleTitle(title) {
  return () => (tree) => {
    let replaced = false;
    walkTree(tree, (node) => {
      if (!replaced && node.type === "element" && node.tagName === "h1") {
        node.children = [{ type: "text", value: title }];
        replaced = true;
      }
    });
  };
}

function rehypeAddSectionActionSlots() {
  return () => (tree) => {
    function wrapHeadings(node) {
      if (!Array.isArray(node.children)) return;
      node.children = node.children.map((child) => {
        if (child.type === "element" && child.tagName === "h2") {
          const sectionId = child.properties?.["data-section-id"];
          if (sectionId) {
            return {
              type: "element",
              tagName: "div",
              properties: { className: ["section-heading-row"] },
              children: [
                child,
                {
                  type: "element",
                  tagName: "div",
                  properties: {
                    className: ["section-collaboration-slot"],
                    "data-section-action-slot": String(sectionId),
                  },
                  children: [],
                },
              ],
            };
          }
        }
        wrapHeadings(child);
        return child;
      });
    }
    wrapHeadings(tree);
  };
}

async function renderArticle(sourcePath, title, markdown) {
  const tableOfContents = [];
  const sections = extractArticleSections(markdown, sourcePath);
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRewriteLinks(sourcePath))
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeSetArticleTitle(title))
    .use(rehypeCollectMetadata(tableOfContents, sections))
    .use(rehypeAddSectionActionSlots())
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
    contentRevision: hashRevision(markdown),
    documentEpoch: extractDocumentEpoch(markdown, sourcePath),
    sections,
    tableOfContents,
  };
}

async function renderQuizInline(markdown) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(markdown);
  const html = String(result).trim();
  const paragraph = html.match(/^<p>([\s\S]*)<\/p>$/);
  if (!paragraph) {
    throw new Error(`选择题字段只允许使用行内 Markdown：${markdown}`);
  }
  return paragraph[1];
}

function cleanSearchText(markdown, articleTitles) {
  return markdown
    .replace(/```[^\n]*\n?/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, (_, label) => articleTitles.has(label.trim()) ? " " : label)
    .replace(/[`*_>#|$\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("zh-CN");
}

function searchableParts(markdown, articleTitles) {
  const content = markdown
    .replace(/^>\s*(?:最近修订|状态)：.*$/gm, "")
    .replace(/^##\s+(?:上一篇|下一篇|返回[^\n]*)\s*$[\s\S]*$/gm, "")
    .replace(/(?:上一篇|下一篇|返回基础篇)/g, " ");
  const headingText = content
    .split("\n")
    .filter((line) => /^#{2,3}\s+/u.test(line))
    .map((line) => line.replace(/^#{2,3}\s+/u, ""))
    .join(" ");
  const bodyText = content
    .split("\n")
    .filter((line) => !/^#{1,3}\s+/u.test(line))
    .join("\n");

  return {
    bodyText: cleanSearchText(bodyText, articleTitles),
    headingText: cleanSearchText(headingText, articleTitles),
  };
}

async function compileLearningQuiz(articleKey, source) {
  const sourcePath = path.join(notesRoot, "learning-path", `${articleKey}.quiz.json`);
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
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      throw new Error(`${path.relative(notesRoot, sourcePath)} 的 ${question.id} 必须包含四个选项`);
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

    question.revision = questionRevision(question);
    question.promptHtml = await renderQuizInline(question.prompt);
    question.explanationHtml = await renderQuizInline(question.explanation);
    for (const option of question.options) {
      if (typeof option.text !== "string" || !option.text.trim()) {
        throw new Error(`${path.relative(notesRoot, sourcePath)} 的 ${question.id} 包含空选项`);
      }
      option.textHtml = await renderQuizInline(option.text);
    }
  }

  const outputPath = path.join(quizCacheRoot, `${articleKey}.json`);
  await mkdir(path.dirname(outputPath), { recursive: true });
  const compiledQuiz = {
    revision: hashRevision(questions.map((question) => `${question.id}:${question.revision}`).join("\n")),
    questions,
  };
  await writeFile(outputPath, `${JSON.stringify(compiledQuiz)}\n`);
  return compiledQuiz;
}

if (fullBuild) {
  await rm(cacheRoot, { force: true, recursive: true });
}
await mkdir(articleCacheRoot, { recursive: true });
await mkdir(quizCacheRoot, { recursive: true });

const compilerRevision = await contentCompilerRevision();
const previousState = fullBuild ? undefined : await readJson(buildStatePath);
const nextState = {
  articles: {},
  compilerRevision,
  quizzes: {},
  version: 1,
};
const [articles, learningPath] = await Promise.all([parseCatalog(), parseLearningStages()]);
const { sourcePaths: learningSourcePaths, stages, titles: learningTitles } = learningPath;
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
  article.learningTitle = learningTitles.get(article.articleKey) ?? article.title;
}
const publishedArticles = articles.filter((article) => article.exists && article.status !== "计划");
const learningArticleKeys = new Set(stages.flatMap((stage) => stage.articleKeys));
const articleTitles = new Set(publishedArticles.map((article) => article.title));
const searchRecords = [];
const interactionDocuments = {};
const learningProgressArticles = {};
const rebuiltArticles = new Set();
let quizCount = 0;
let rebuiltQuizCount = 0;

async function loadArticleVariant(article, variant, sourcePath, title, markdown, fallback) {
  const stateKey = `${variant}:${article.articleKey}`;
  const outputPath = path.join(articleCacheRoot, variant, `${article.articleKey}.json`);
  const displayTitle = article.kind === "extension" ? `*${title}` : title;
  const inputHash = hashParts("article-v1", compilerRevision, sourcePath, displayTitle, markdown);
  nextState.articles[stateKey] = {
    hash: inputHash,
    outputPath: path.relative(cacheRoot, outputPath),
  };

  const previous = previousState?.version === 1 ? previousState.articles?.[stateKey] : undefined;
  if (!fullBuild && previous?.hash === inputHash && await fileExists(outputPath)) {
    const cached = await readJson(outputPath);
    if (cached) {
      return cached;
    }
  }

  const rendered = fallback ?? await renderArticle(sourcePath, displayTitle, markdown);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(rendered)}\n`);
  rebuiltArticles.add(article.articleKey);
  return rendered;
}

for (const article of publishedArticles) {
  const markdown = await readFile(path.join(notesRoot, article.sourcePath), "utf8");
  const searchText = searchableParts(markdown, articleTitles);
  const catalogRendered = await loadArticleVariant(
    article,
    "catalog",
    article.sourcePath,
    article.title,
    markdown,
  );
  const sameLearningVariant = article.learningSourcePath === article.sourcePath
    && article.learningTitle === article.title;
  const learningMarkdown = article.learningSourcePath === article.sourcePath
    ? markdown
    : await readFile(path.join(notesRoot, article.learningSourcePath), "utf8");
  const learningRendered = await loadArticleVariant(
    article,
    "learning-path",
    article.learningSourcePath,
    article.learningTitle,
    learningMarkdown,
    sameLearningVariant ? catalogRendered : undefined,
  );
  if (learningArticleKeys.has(article.articleKey)) {
    interactionDocuments[`learning-path:${article.articleKey}`] = {
      articleKey: article.articleKey,
      contentRevision: learningRendered.contentRevision,
      documentEpoch: learningRendered.documentEpoch,
      sections: learningRendered.sections,
    };
  }
  searchRecords.push({
    articleKey: article.articleKey,
    title: `${article.kind === "extension" ? "*" : ""}${article.title}`,
    moduleTitle: article.moduleTitle,
    route: article.catalogRoute,
    status: article.status,
    bodyText: searchText.bodyText,
    headingText: searchText.headingText,
  });
}

const compiledQuizzes = await Promise.all([...learningArticleKeys].map(async (articleKey) => {
  const sourcePath = path.join(notesRoot, "learning-path", `${articleKey}.quiz.json`);
  if (!(await fileExists(sourcePath))) {
    return [articleKey, undefined];
  }

  quizCount += 1;
  const source = await readFile(sourcePath, "utf8");
  const inputHash = hashParts("quiz-v1", compilerRevision, source);
  const outputPath = path.join(quizCacheRoot, `${articleKey}.json`);
  nextState.quizzes[articleKey] = {
    hash: inputHash,
    outputPath: path.relative(cacheRoot, outputPath),
  };
  const previous = previousState?.version === 1 ? previousState.quizzes?.[articleKey] : undefined;
  if (!fullBuild && previous?.hash === inputHash && await fileExists(outputPath)) {
    const cached = await readJson(outputPath);
    if (cached) {
      return [articleKey, cached];
    }
  }

  rebuiltQuizCount += 1;
  return [articleKey, await compileLearningQuiz(articleKey, source)];
}));
for (const [articleKey, quiz] of compiledQuizzes) {
  if (quiz && interactionDocuments[`learning-path:${articleKey}`]) {
    const progressQuestions = quiz.questions.map((question) => ({
      correctOptionId: question.correctOptionId,
      id: question.id,
      optionIds: question.options.map((option) => option.id),
      revision: question.revision,
    }));
    interactionDocuments[`learning-path:${articleKey}`].questions = progressQuestions;
    learningProgressArticles[articleKey] = {
      documentEpoch: interactionDocuments[`learning-path:${articleKey}`].documentEpoch,
      questions: progressQuestions.map(({ correctOptionId, id, revision }) => ({
        correctOptionId,
        id,
        revision,
      })),
    };
  }
}
await writeFile(path.join(cacheRoot, "manifest.json"), `${JSON.stringify({ articles, stages })}\n`);
await writeFile(
  learningProgressPath,
  `${JSON.stringify({ articles: learningProgressArticles })}\n`,
);
await writeFile(
  path.join(cacheRoot, "interaction-manifest.json"),
  `${JSON.stringify({ documents: interactionDocuments })}\n`,
);

await mkdir(path.dirname(searchIndexPath), { recursive: true });
await writeFile(searchIndexPath, `${JSON.stringify(searchRecords)}\n`);
await writeFile(buildStatePath, `${JSON.stringify(nextState)}\n`);

const modeLabel = fullBuild ? "全量" : "增量";
console.log(
  `内容预编译（${modeLabel}）：重新生成 ${rebuiltArticles.size} 篇、复用 ${publishedArticles.length - rebuiltArticles.size} 篇；`
  + `重新生成 ${rebuiltQuizCount} 份题目、复用 ${quizCount - rebuiltQuizCount} 份。`,
);
