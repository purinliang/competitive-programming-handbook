import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import GithubSlugger from "github-slugger";

import type { ArticleRecord, ArticleStatus, LearningStage, ModuleRecord } from "./types";

export const NOTES_ROOT = path.resolve(process.cwd(), "../../notes");

const ARTICLE_STATUSES = new Set<ArticleStatus>(["计划", "待审阅", "已审阅", "草稿", "定稿"]);

let cachedArticles: ArticleRecord[] | undefined;
let cachedStages: LearningStage[] | undefined;

function extractMarkdownPath(cell: string): string | undefined {
  return cell.match(/\]\(([^)]+\.md)(?:#[^)]+)?\)/)?.[1] ?? cell.match(/`([^`]+\.md)`/)?.[1];
}

function toArticleKey(sourcePath: string): string {
  return sourcePath.replace(/\\/g, "/").replace(/\.md$/, "");
}

export function getArticles(): ArticleRecord[] {
  if (cachedArticles) {
    return cachedArticles;
  }

  const catalog = readFileSync(path.join(NOTES_ROOT, "CATALOG.md"), "utf8");
  const articles: ArticleRecord[] = [];
  let moduleKey = "";
  let moduleTitle = "";
  let moduleAnchor = "";
  const moduleSlugger = new GithubSlugger();

  for (const line of catalog.split("\n")) {
    const moduleMatch = line.match(/^##\s+(\d+\s+.+)$/);
    if (moduleMatch) {
      moduleTitle = moduleMatch[1].replace(/^\d+\s+/, "").trim();
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

    const [catalogId, title, rawStatus, fileCell] = cells;
    const sourcePath = extractMarkdownPath(fileCell);
    if (!sourcePath || !ARTICLE_STATUSES.has(rawStatus as ArticleStatus)) {
      continue;
    }

    const articleKey = toArticleKey(sourcePath);
    const pathParts = articleKey.split("/");
    moduleKey ||= pathParts[0];
    const articleSlug = pathParts.at(-1) ?? articleKey;

    articles.push({
      articleKey,
      articleSlug,
      catalogId,
      title,
      status: rawStatus as ArticleStatus,
      kind: catalogId.includes("*") || catalogId.includes("e") ? "extension" : "core",
      moduleKey,
      moduleTitle,
      moduleAnchor,
      sourcePath,
      route: `/${articleKey}/`,
      exists: existsSync(path.join(NOTES_ROOT, sourcePath)),
    });
  }

  const duplicateKeys = articles.filter(
    (article, index) => articles.findIndex((candidate) => candidate.articleKey === article.articleKey) !== index,
  );
  if (duplicateKeys.length > 0) {
    throw new Error(`CATALOG.md 中存在重复 article_key：${duplicateKeys.map((item) => item.articleKey).join(", ")}`);
  }

  cachedArticles = articles;
  return articles;
}

export function getModules(): ModuleRecord[] {
  const modules = new Map<string, ModuleRecord>();

  for (const article of getArticles()) {
    const module = modules.get(article.moduleKey) ?? {
      key: article.moduleKey,
      title: article.moduleTitle,
      anchor: article.moduleAnchor,
      articles: [],
    };
    module.articles.push(article);
    modules.set(article.moduleKey, module);
  }

  return [...modules.values()];
}

export function getArticle(articleKey: string): ArticleRecord | undefined {
  return getArticles().find((article) => article.articleKey === articleKey);
}

export function getLearningStages(): LearningStage[] {
  if (cachedStages) {
    return cachedStages;
  }

  const learningPath = readFileSync(path.join(NOTES_ROOT, "LEARNING-PATH.md"), "utf8");
  const stages: LearningStage[] = [];
  let currentStage: LearningStage | undefined;

  for (const line of learningPath.split("\n")) {
    const stageMatch = line.match(/^##\s+(阶段\s+\d+)：(.+)$/);
    if (stageMatch) {
      currentStage = {
        key: stageMatch[1].replace(/\s+/g, "-"),
        title: stageMatch[2].trim(),
        articleKeys: [],
      };
      stages.push(currentStage);
      continue;
    }

    if (!currentStage || !/^\|\s*\d/.test(line)) {
      continue;
    }

    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    const sourcePath = cells.length === 4 ? extractMarkdownPath(cells[3]) : undefined;
    if (sourcePath) {
      currentStage.articleKeys.push(toArticleKey(sourcePath));
    }
  }

  cachedStages = stages;
  return stages;
}

export function getLearningArticles(): ArticleRecord[] {
  const articles = new Map(getArticles().map((article) => [article.articleKey, article]));
  return getLearningStages().flatMap((stage) =>
    stage.articleKeys.map((articleKey) => articles.get(articleKey)).filter((article): article is ArticleRecord => Boolean(article)),
  );
}

export function getArticleNeighbors(articleKey: string): { previous?: ArticleRecord; next?: ArticleRecord } {
  const route = getLearningArticles().filter((article) => article.exists && article.status !== "计划");
  const index = route.findIndex((article) => article.articleKey === articleKey);

  if (index < 0) {
    return {};
  }

  return {
    previous: route[index - 1],
    next: route[index + 1],
  };
}
