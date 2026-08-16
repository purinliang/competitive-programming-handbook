import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import type { ArticleFamily, ArticleNavigation, ArticleRecord, LearningStage, ModuleRecord } from "./types";

interface ContentManifest {
  articles: ArticleRecord[];
  stages: LearningStage[];
}

let cachedManifest: ContentManifest | undefined;

function getManifest(): ContentManifest {
  cachedManifest ??= JSON.parse(readFileSync(path.join(process.cwd(), ".content-cache/manifest.json"), "utf8")) as ContentManifest;
  return cachedManifest;
}

export function getArticles(): ArticleRecord[] {
  return getManifest().articles;
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
  return getManifest().stages;
}

export function getLearningArticles(): ArticleRecord[] {
  const articles = new Map(getArticles().map((article) => [article.articleKey, article]));
  return getLearningStages().flatMap((stage) =>
    stage.articleKeys.map((articleKey) => articles.get(articleKey)).filter((article): article is ArticleRecord => Boolean(article)),
  );
}

function getCoreLearningArticles(): ArticleRecord[] {
  const articles = new Map(getArticles().map((article) => [article.articleKey, article]));
  return getLearningStages().flatMap((stage) => stage.articleKeys
    .map((articleKey) => articles.get(articleKey))
    .filter((article): article is ArticleRecord => article?.kind === "core"));
}

export function getArticleLearningNeighbors(articleKey: string): { previous?: ArticleRecord; next?: ArticleRecord } {
  const stage = getLearningStages().find((item) => item.articleKeys.includes(articleKey));
  const unit = stage?.units.find((item) => item.articleKeys.includes(articleKey));
  const articles = new Map(getArticles().map((article) => [article.articleKey, article]));
  const current = articles.get(articleKey);
  const route = current?.kind === "extension"
    ? (unit?.articleKeys ?? []).map((key) => articles.get(key)).filter((article): article is ArticleRecord => Boolean(article?.exists && article.status !== "计划"))
    : getCoreLearningArticles().filter((article) => article.exists && article.status !== "计划");
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
    (candidate) => candidate.moduleKey === article.moduleKey
      && candidate.exists
      && candidate.status !== "计划",
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
      groups.push({ title: article.title, articles: [article], grouped: false, continued: false, stripTitlePrefix: false });
      continue;
    }

    const title = article.title.slice(0, separator);
    const familyKey = `${article.moduleKey}:${title}`;
    const previous = groups.at(-1);
    if (previous?.grouped && previous.title === title && previous.articles[0].moduleKey === article.moduleKey) {
      previous.articles.push(article);
    } else {
      groups.push({ title, articles: [article], grouped: true, continued: seenFamilies.has(familyKey), stripTitlePrefix: true });
      seenFamilies.add(familyKey);
    }
  }

  return groups;
}

export function getCatalogGroups(articles: ArticleRecord[]): ArticleFamily[] {
  if (!articles.some((article) => article.catalogFamilyTitle)) {
    return groupAdjacentArticles(articles);
  }

  const groups: ArticleFamily[] = [];
  for (const article of articles) {
    const title = article.catalogFamilyTitle ?? "其他";
    const previous = groups.at(-1);
    if (previous?.title === title) {
      previous.articles.push(article);
      continue;
    }
    groups.push({ title, articles: [article], grouped: true, continued: false, stripTitlePrefix: false });
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
    stripTitlePrefix: false,
  }));
}

export function getArticleModuleNavigation(articleKey: string): ArticleNavigation | undefined {
  const article = getArticle(articleKey);
  if (!article) {
    return undefined;
  }

  const module = getModules().find((item) => item.key === article.moduleKey);
  const groups = getCatalogGroups(module?.articles ?? [article]);

  return {
    label: "模块",
    title: article.moduleTitle,
    groups,
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
    label: "学习路线",
    title: `${stage.number} ${stage.title}`,
    groups: getLearningUnitGroups(stage),
  };
}
