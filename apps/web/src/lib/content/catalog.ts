import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import type {
  ArticleFamily,
  ArticleNavigation,
  ArticleNavigationTarget,
  ArticleRecord,
  CatalogArea,
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
    for (const placement of article.catalogPlacements) {
      const module = modules.get(placement.moduleKey) ?? {
        key: placement.moduleKey,
        title: placement.moduleTitle,
        anchor: placement.moduleAnchor,
        position: placement.position,
        articles: [],
      };
      module.position = Math.min(module.position, placement.position);
      if (!module.articles.some((item) => item.articleKey === article.articleKey)) {
        module.articles.push(article);
      }
      modules.set(placement.moduleKey, module);
    }
  }

  return [...modules.values()].sort((left, right) => left.position - right.position);
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

  const placement = article.catalogPlacements.find(
    (item) => item.key === requestedEntryKey,
  ) ?? article.catalogPlacements[0];
  if (!placement) return {};

  const module = getModules().find((item) => item.key === placement.moduleKey);
  const groups = getCatalogAreas(
    placement.moduleKey,
    module?.articles ?? [article],
  ).flatMap((area) => area.groups);
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
    const familyKey = title;
    const previous = groups.at(-1);
    if (previous?.grouped && previous.title === title) {
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

export function getCatalogAreas(
  moduleKey: string,
  articles: ArticleRecord[],
): CatalogArea[] {
  const articleByKey = new Map(
    articles.map((article) => [article.articleKey, article]),
  );
  const areas = new Map<
    string,
    {
      key: string;
      title: string;
      position: number;
      entries: Array<{
        article: ArticleRecord;
        entryKey: string;
        position: number;
        topicKey?: string;
        topicTitle?: string;
      }>;
    }
  >();

  for (const article of articles) {
    for (const placement of article.catalogPlacements) {
      if (placement.moduleKey !== moduleKey) continue;

      const area = areas.get(placement.areaKey) ?? {
        key: placement.areaKey,
        title: placement.areaTitle,
        position: placement.areaPosition,
        entries: [],
      };
      area.position = Math.min(area.position, placement.areaPosition);
      area.entries.push({
        article,
        entryKey: placement.key,
        position: placement.position,
        topicKey: placement.topicKey,
        topicTitle: placement.topicTitle,
      });
      areas.set(placement.areaKey, area);
    }
  }

  return [...areas.values()].sort((left, right) => left.position - right.position)
    .map((area) => {
      const groups: ArticleFamily[] = [];
      const topics = new Map<string, ArticleFamily>();
      let directGroup: ArticleFamily | undefined;

      for (const entry of area.entries.sort((left, right) => left.position - right.position)) {
        if (!articleByKey.has(entry.article.articleKey)) continue;

        if (!entry.topicKey || !entry.topicTitle) {
          if (!directGroup) {
            directGroup = {
              title: area.title,
              articles: [],
              entryKeys: [],
              grouped: false,
              continued: false,
              stripTitlePrefix: false,
            };
            groups.push(directGroup);
          }
          directGroup.articles.push(entry.article);
          directGroup.entryKeys.push(entry.entryKey);
          continue;
        }

        let topic = topics.get(entry.topicKey);
        if (!topic) {
          topic = {
            title: entry.topicTitle,
            articles: [],
            entryKeys: [],
            grouped: true,
            continued: false,
            stripTitlePrefix: false,
          };
          topics.set(entry.topicKey, topic);
          groups.push(topic);
        }
        topic.articles.push(entry.article);
        topic.entryKeys.push(entry.entryKey);
      }

      return {
        key: area.key,
        title: area.title,
        groups,
      };
    });
}

export function getCatalogGroups(
  moduleKey: string,
  articles: ArticleRecord[],
): ArticleFamily[] {
  return getCatalogAreas(moduleKey, articles).flatMap((area) => area.groups);
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

  const placements = [...article.catalogPlacements].sort((left, right) => {
    const leftRank = left.moduleKey === article.moduleKey
      ? (left.areaTitle === "常用" ? 1 : 0)
      : 2;
    const rightRank = right.moduleKey === article.moduleKey
      ? (right.areaTitle === "常用" ? 1 : 0)
      : 2;
    return leftRank - rightRank || left.position - right.position;
  });

  return placements.map((placement) => {
    const module = getModules().find((item) => item.key === placement.moduleKey);
    const areas = getCatalogAreas(
      placement.moduleKey,
      module?.articles ?? [article],
    );
    const groups = areas.flatMap((area) => area.groups);
    const neighbors = getArticleModuleNeighbors(articleKey, placement.key);
    return {
      label: "模块",
      title: placement.moduleTitle,
      groups,
      areas,
      activeEntryKey: placement.key,
      ...neighbors,
    };
  });
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
