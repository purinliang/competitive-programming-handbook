import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import GithubSlugger from "github-slugger";

import type { ArticleFamily, ArticleNavigation, ArticleRecord, ArticleStatus, LearningStage, ModuleRecord } from "./types";

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
  let currentUnit: LearningStage["units"][number] | undefined;

  for (const line of learningPath.split("\n")) {
    const stageMatch = line.match(/^##\s+(阶段\s+\d+)：(.+)$/);
    if (stageMatch) {
      currentStage = {
        key: stageMatch[1].replace(/\s+/g, "-"),
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

  cachedStages = stages;
  return stages;
}

export function getLearningArticles(): ArticleRecord[] {
  const articles = new Map(getArticles().map((article) => [article.articleKey, article]));
  return getLearningStages().flatMap((stage) =>
    stage.articleKeys.map((articleKey) => articles.get(articleKey)).filter((article): article is ArticleRecord => Boolean(article)),
  );
}

export function getArticleLearningNeighbors(articleKey: string): { previous?: ArticleRecord; next?: ArticleRecord } {
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

export function getArticleModuleNeighbors(articleKey: string): { previous?: ArticleRecord; next?: ArticleRecord } {
  const article = getArticle(articleKey);
  if (!article) {
    return {};
  }

  const route = getArticles().filter(
    (candidate) => candidate.moduleKey === article.moduleKey && candidate.exists && candidate.status !== "计划",
  );
  const index = route.findIndex((candidate) => candidate.articleKey === articleKey);
  return index < 0 ? {} : { previous: route[index - 1], next: route[index + 1] };
}

export function groupAdjacentArticles(articles: ArticleRecord[]): ArticleFamily[] {
  const groups: ArticleFamily[] = [];
  const seenFamilies = new Set<string>();

  for (const article of articles) {
    const separator = article.title.indexOf("：");
    if (separator < 0) {
      groups.push({ title: article.title, articles: [article], grouped: false, continued: false });
      continue;
    }

    const title = article.title.slice(0, separator);
    const familyKey = `${article.moduleKey}:${title}`;
    const previous = groups.at(-1);
    if (previous?.grouped && previous.title === title && previous.articles[0].moduleKey === article.moduleKey) {
      previous.articles.push(article);
    } else {
      groups.push({ title, articles: [article], grouped: true, continued: seenFamilies.has(familyKey) });
      seenFamilies.add(familyKey);
    }
  }

  return groups;
}

export function getLearningUnitGroups(stage: LearningStage): ArticleFamily[] {
  if (stage.units.length === 0) {
    const articles = stage.articleKeys.flatMap((articleKey) => {
      const article = getArticle(articleKey);
      return article ? [article] : [];
    });
    return groupAdjacentArticles(articles);
  }

  return stage.units.map((unit) => ({
    title: unit.title,
    articles: unit.articleKeys.flatMap((articleKey) => {
      const article = getArticle(articleKey);
      return article ? [article] : [];
    }),
    grouped: true,
    continued: false,
  }));
}

export function getArticleModuleNavigation(articleKey: string): ArticleNavigation | undefined {
  const article = getArticle(articleKey);
  if (!article) {
    return undefined;
  }

  const module = getModules().find((item) => item.key === article.moduleKey);
  const groups = groupAdjacentArticles(module?.articles ?? [article]);

  return {
    label: "模块",
    title: article.moduleTitle,
    groups,
    primaryRoute: `/catalog/#${article.moduleAnchor}`,
    primaryLabel: "查看完整模块",
    secondaryRoute: "/learn/",
    secondaryLabel: "切换到学习路线",
  };
}

export function getArticleLearningNavigation(articleKey: string): ArticleNavigation | undefined {
  const article = getArticle(articleKey);
  if (!article) {
    return undefined;
  }

  const stage = getLearningStages().find((item) => item.articleKeys.includes(articleKey));
  if (!stage) {
    return undefined;
  }

  return {
    label: stage.key.replace("-", " "),
    title: stage.title,
    groups: getLearningUnitGroups(stage),
    primaryRoute: `/learn/#${stage.key}`,
    primaryLabel: "查看完整阶段",
    secondaryRoute: `/catalog/#${article.moduleAnchor}`,
    secondaryLabel: `切换到${article.moduleTitle}模块`,
  };
}
