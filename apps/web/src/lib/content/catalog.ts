import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import type {
  ArticleFamily,
  ArticleNavigation,
  ArticleNavigationTarget,
  ArticleRecord,
  LearningStage,
  ModuleRecord,
} from "./types";

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
  const route = getLearningStages().flatMap((stage) => stage.articleKeys
    .map((articleKey) => articles.get(articleKey))
    .filter((article): article is ArticleRecord => Boolean(article)));
  return [...new Map(route.map((article) => [article.articleKey, article])).values()];
}

function getLearningEntries(stage: LearningStage): ArticleNavigationTarget[] {
  const articles = new Map(getArticles().map((article) => [article.articleKey, article]));
  return stage.articleKeys.flatMap((articleKey, index) => {
    const article = articles.get(articleKey);
    const entryKey = stage.entryKeys[index];
    return article && entryKey ? [{ article, entryKey }] : [];
  });
}

function getCoreLearningEntries(): ArticleNavigationTarget[] {
  return getLearningStages().flatMap(getLearningEntries)
    .filter(({ article }) => article.kind === "core");
}

function findLearningPlacement(articleKey: string, requestedEntryKey?: string) {
  for (const stage of getLearningStages()) {
    const entries = getLearningEntries(stage);
    const requested = requestedEntryKey
      ? entries.find((entry) => entry.entryKey === requestedEntryKey && entry.article.articleKey === articleKey)
      : undefined;
    const current = requested ?? entries.find((entry) => entry.article.articleKey === articleKey);
    if (!current) continue;
    const unit = stage.units.find((item) => item.entryKeys.includes(current.entryKey));
    return { current, stage, unit };
  }
  return undefined;
}

export function getArticleLearningNeighbors(
  articleKey: string,
  requestedEntryKey?: string,
): { previous?: ArticleNavigationTarget; next?: ArticleNavigationTarget } {
  const placement = findLearningPlacement(articleKey, requestedEntryKey);
  if (!placement) return {};

  const route = placement.current.article.kind === "extension"
    ? (placement.unit?.articleKeys ?? []).flatMap((key, index) => {
        const article = getArticle(key);
        const entryKey = placement.unit?.entryKeys[index];
        return article && entryKey ? [{ article, entryKey }] : [];
      })
    : getCoreLearningEntries();
  const available = route.filter(({ article }) => article.exists && article.status !== "计划");
  const index = available.findIndex((entry) => entry.entryKey === placement.current.entryKey);

  if (index < 0) {
    return {};
  }

  return {
    previous: available[index - 1],
    next: available[index + 1],
  };
}

export function getArticleModuleNeighbors(
  articleKey: string,
  requestedEntryKey?: string,
): { previous?: ArticleNavigationTarget; next?: ArticleNavigationTarget } {
  const article = getArticle(articleKey);
  if (!article) {
    return {};
  }

  const module = getModules().find((item) => item.key === article.moduleKey);
  const groups = getCatalogGroups(module?.articles ?? [article]);
  const group = groups.find((item) => requestedEntryKey && item.entryKeys.includes(requestedEntryKey))
    ?? groups.find((item) => item.articles.some((candidate) => candidate.articleKey === articleKey));
  if (!group) return {};

  const route = group.articles.flatMap((candidate, index) => {
    const entryKey = group.entryKeys[index];
    return candidate.exists && candidate.status !== "计划" && entryKey
      ? [{ article: candidate, entryKey }]
      : [];
  });
  const index = route.findIndex((entry) => (
    requestedEntryKey
      ? entry.entryKey === requestedEntryKey
      : entry.article.articleKey === articleKey
  ));
  return index < 0 ? {} : { previous: route[index - 1], next: route[index + 1] };
}

function fallbackEntryKey(article: ArticleRecord): string {
  return `catalog-article:${article.articleKey}`;
}

export function groupAdjacentArticles(
  articles: ArticleRecord[],
  providedEntryKeys?: string[],
): ArticleFamily[] {
  const groups: ArticleFamily[] = [];
  const seenFamilies = new Set<string>();

  for (const [index, article] of articles.entries()) {
    const entryKey = providedEntryKeys?.[index] ?? fallbackEntryKey(article);
    const separator = article.title.indexOf("：");
    if (separator < 0) {
      groups.push({
        title: article.title,
        articles: [article],
        entryKeys: [entryKey],
        grouped: false,
        continued: false,
        stripTitlePrefix: false,
      });
      continue;
    }

    const title = article.title.slice(0, separator);
    const familyKey = `${article.moduleKey}:${title}`;
    const previous = groups.at(-1);
    if (previous?.grouped && previous.title === title && previous.articles[0].moduleKey === article.moduleKey) {
      previous.articles.push(article);
      previous.entryKeys.push(entryKey);
    } else {
      groups.push({
        title,
        articles: [article],
        entryKeys: [entryKey],
        grouped: true,
        continued: seenFamilies.has(familyKey),
        stripTitlePrefix: true,
      });
      seenFamilies.add(familyKey);
    }
  }

  return groups;
}

export function getCatalogGroups(articles: ArticleRecord[]): ArticleFamily[] {
  if (!articles.some((article) => article.catalogTopics.length > 0)) {
    return groupAdjacentArticles(articles);
  }

  const topics = new Map<
    string,
    {
      title: string;
      position: number;
      articles: Array<{
        article: ArticleRecord;
        entryKey: string;
        position: number;
      }>;
    }
  >();
  for (const article of articles) {
    for (const membership of article.catalogTopics) {
      const topic = topics.get(membership.key) ?? {
        title: membership.title,
        position: membership.position,
        articles: [],
      };
      topic.position = Math.min(topic.position, membership.position);
      topic.articles.push({
        article,
        entryKey: `${membership.key}:${article.articleKey}`,
        position: membership.position,
      });
      topics.set(membership.key, topic);
    }
  }

  return [...topics.values()]
    .sort((left, right) => left.position - right.position)
    .map((topic) => {
      const entries = topic.articles.sort((left, right) => left.position - right.position);
      return {
        title: topic.title,
        articles: entries.map((item) => item.article),
        entryKeys: entries.map((item) => item.entryKey),
        grouped: true,
        continued: false,
        stripTitlePrefix: false,
      };
    });
}

export function getLearningUnitGroups(stage: LearningStage): ArticleFamily[] {
  if (stage.units.length === 0) {
    const entries = stage.articleKeys.flatMap((articleKey, index) => {
      const article = getArticle(articleKey);
      const entryKey = stage.entryKeys[index];
      return article && entryKey ? [{ article, entryKey }] : [];
    });
    return groupAdjacentArticles(
      entries.map((entry) => entry.article),
      entries.map((entry) => entry.entryKey),
    );
  }

  return stage.units.map((unit) => {
    const entries = unit.articleKeys.flatMap((articleKey, index) => {
      const article = getArticle(articleKey);
      const entryKey = unit.entryKeys[index];
      return article && entryKey ? [{ article, entryKey }] : [];
    });
    return {
      title: unit.title,
      articles: entries.map((entry) => entry.article),
      entryKeys: entries.map((entry) => entry.entryKey),
      grouped: true,
      continued: false,
      stripTitlePrefix: false,
    };
  });
}

export function getArticleModuleNavigations(articleKey: string): ArticleNavigation[] {
  const article = getArticle(articleKey);
  if (!article) {
    return [];
  }

  const module = getModules().find((item) => item.key === article.moduleKey);
  const groups = getCatalogGroups(module?.articles ?? [article]);
  return groups.flatMap((group) => group.articles.flatMap((candidate, index) => {
    const activeEntryKey = group.entryKeys[index];
    if (candidate.articleKey !== articleKey || !activeEntryKey) {
      return [];
    }
    const neighbors = getArticleModuleNeighbors(articleKey, activeEntryKey);
    return [{
      label: "模块",
      title: article.moduleTitle,
      groups,
      activeEntryKey,
      ...neighbors,
    }];
  }));
}

export function getArticleLearningNavigations(articleKey: string): ArticleNavigation[] {
  const article = getArticle(articleKey);
  if (!article) {
    return [];
  }

  return getLearningStages().flatMap((stage) => getLearningEntries(stage)
    .filter((entry) => entry.article.articleKey === articleKey)
    .map((entry) => ({
      label: "学习路线",
      title: `${stage.number} ${stage.title}`,
      groups: getLearningUnitGroups(stage),
      activeEntryKey: entry.entryKey,
      ...getArticleLearningNeighbors(articleKey, entry.entryKey),
    })));
}
