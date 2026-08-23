import type {
  ArticleFamily,
  ArticleNavigation,
  ArticleNavigationTarget,
  ArticleRecord,
  CatalogArea,
  ContentManifest,
  DirectoryReturnTarget,
  LearningProgressManifest,
  LearningQuiz,
  LearningStage,
  ModuleRecord,
  NavigationMode,
  RenderedArticle,
  RuntimeContentManifest,
  RuntimeContentObject,
  RuntimeContentRelease,
  RuntimeContentVariant,
} from "./types";
import type { SearchRecord } from "../search-ranking";

let contentManifestPromise: Promise<RuntimeContentManifest> | undefined;
let navigationManifest: ContentManifest | undefined;
let navigationManifestPromise: Promise<ContentManifest> | undefined;
let releasePromise: Promise<RuntimeContentRelease> | undefined;

export function resetRuntimeContentCache() {
  contentManifestPromise = undefined;
  navigationManifest = undefined;
  navigationManifestPromise = undefined;
  releasePromise = undefined;
}

async function readJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return await response.json() as T;
}

function verifiedObjectPath(object: RuntimeContentObject): string {
  if (!object.objectPath.includes(object.contentHash)) {
    throw new Error("内容索引未通过完整性检查");
  }
  return object.objectPath;
}

async function readRuntimeObject<T>(object: RuntimeContentObject) {
  return await readJson<T>(verifiedObjectPath(object), {
    cache: "force-cache",
  });
}

export function getRuntimeRelease() {
  releasePromise ??= readJson<RuntimeContentRelease>(
    "/content/release.json",
    { cache: "no-cache" },
  ).catch((error) => {
    releasePromise = undefined;
    throw error;
  });
  return releasePromise;
}

export function getRuntimeContentManifest() {
  contentManifestPromise ??= getRuntimeRelease()
    .then((release) => readRuntimeObject<RuntimeContentManifest>(
      release.articleManifest,
    )).catch((error) => {
      contentManifestPromise = undefined;
      throw error;
    });
  return contentManifestPromise;
}

export function getRuntimeNavigationManifest() {
  navigationManifestPromise ??= getRuntimeRelease()
    .then((release) => readRuntimeObject<ContentManifest>(
      release.navigation,
    )).then((manifest) => {
      navigationManifest = manifest;
      return manifest;
    }).catch((error) => {
      navigationManifestPromise = undefined;
      throw error;
    });
  return navigationManifestPromise;
}

export function getCachedRuntimeNavigationManifest() {
  return navigationManifest;
}

export async function getRuntimeLearningProgressManifest() {
  const release = await getRuntimeRelease();
  return await readRuntimeObject<LearningProgressManifest>(
    release.learningProgress,
  );
}

export async function getRuntimeSearchIndex() {
  const release = await getRuntimeRelease();
  return await readRuntimeObject<SearchRecord[]>(release.searchIndex);
}

export async function getRuntimeArticle(
  articleKey: string,
  mode: NavigationMode,
  signal?: AbortSignal,
): Promise<{
  rendered: RenderedArticle;
  variant: RuntimeContentVariant;
}> {
  const manifest = await getRuntimeContentManifest();
  const variant = manifest.articles[articleKey]?.[mode];
  if (!variant) throw new Error("正文不存在");
  const rendered = await readJson<RenderedArticle>(
    verifiedObjectPath(variant),
    { cache: "force-cache", signal },
  );
  if (
    rendered.contentRevision !== variant.contentRevision
    || rendered.documentEpoch !== variant.documentEpoch
  ) {
    throw new Error("正文索引与正文对象版本不一致");
  }
  return { rendered, variant };
}

export async function getRuntimeQuiz(
  variant: RuntimeContentVariant,
  signal?: AbortSignal,
): Promise<LearningQuiz | undefined> {
  if (!variant.quiz) return undefined;
  const quiz = await readJson<LearningQuiz>(
    verifiedObjectPath(variant.quiz),
    { cache: "force-cache", signal },
  );
  if (quiz.revision !== variant.quiz.revision) {
    throw new Error("小测索引与小测对象版本不一致");
  }
  return quiz;
}

export function createRuntimeCatalog(manifest: ContentManifest) {
  const articleByKey = new Map(
    manifest.articles.map((article) => [article.articleKey, article]),
  );
  let moduleCache: ModuleRecord[] | undefined;

  function getArticle(articleKey: string) {
    return articleByKey.get(articleKey);
  }

  function getModules(): ModuleRecord[] {
    if (moduleCache) return moduleCache;
    const modules = new Map<string, ModuleRecord>();
    for (const article of manifest.articles) {
      for (const placement of article.catalogPlacements) {
        const module = modules.get(placement.moduleKey) ?? {
          key: placement.moduleKey,
          title: placement.moduleTitle,
          anchor: placement.moduleAnchor,
          position: placement.position,
          articles: [],
        };
        module.position = Math.min(module.position, placement.position);
        if (!module.articles.some(
          (item) => item.articleKey === article.articleKey,
        )) {
          module.articles.push(article);
        }
        modules.set(placement.moduleKey, module);
      }
    }
    moduleCache = [...modules.values()].sort(
      (left, right) => left.position - right.position,
    );
    return moduleCache;
  }

  function learningEntries(stage: LearningStage): ArticleNavigationTarget[] {
    return stage.articleKeys.flatMap((articleKey, index) => {
      const article = getArticle(articleKey);
      const entryKey = stage.entryKeys[index];
      return article && entryKey ? [{ article, entryKey }] : [];
    });
  }

  function learningGroups(stage: LearningStage): ArticleFamily[] {
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

  function findLearningPlacement(
    articleKey: string,
    requestedEntryKey?: string,
  ) {
    for (const stage of manifest.stages) {
      const entries = learningEntries(stage);
      const requested = requestedEntryKey
        ? entries.find((entry) => (
            entry.entryKey === requestedEntryKey
            && entry.article.articleKey === articleKey
          ))
        : undefined;
      const current = requested ?? entries.find(
        (entry) => entry.article.articleKey === articleKey,
      );
      if (!current) continue;
      const unit = stage.units.find(
        (item) => item.entryKeys.includes(current.entryKey),
      );
      return { current, stage, unit };
    }
    return undefined;
  }

  function learningNeighbors(
    articleKey: string,
    requestedEntryKey?: string,
  ) {
    const placement = findLearningPlacement(articleKey, requestedEntryKey);
    if (!placement) return {};
    const coreEntries = manifest.stages.flatMap(learningEntries)
      .filter(({ article }) => article.kind === "core");
    const route = placement.current.article.kind === "extension"
      ? (placement.unit?.articleKeys ?? []).flatMap((key, index) => {
          const article = getArticle(key);
          const entryKey = placement.unit?.entryKeys[index];
          return article && entryKey ? [{ article, entryKey }] : [];
        })
      : coreEntries;
    const available = route.filter(({ article }) => (
      article.exists && !["计划", "推迟"].includes(article.status)
    ));
    const index = available.findIndex(
      (entry) => entry.entryKey === placement.current.entryKey,
    );
    return index < 0 ? {} : {
      previous: available[index - 1],
      next: available[index + 1],
    };
  }

  function catalogAreas(
    moduleKey: string,
    articles: ArticleRecord[],
  ): CatalogArea[] {
    const included = new Set(
      articles.map((article) => article.articleKey),
    );
    const areas = new Map<string, {
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
    }>();

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

    return [...areas.values()]
      .sort((left, right) => left.position - right.position)
      .map((area) => {
        const groups: ArticleFamily[] = [];
        const topics = new Map<string, ArticleFamily>();
        let directGroup: ArticleFamily | undefined;
        for (const entry of area.entries.sort(
          (left, right) => left.position - right.position,
        )) {
          if (!included.has(entry.article.articleKey)) continue;
          if (!entry.topicKey || !entry.topicTitle) {
            directGroup ??= {
              title: area.title,
              articles: [],
              entryKeys: [],
              grouped: false,
              continued: false,
              stripTitlePrefix: false,
            };
            if (!groups.includes(directGroup)) groups.push(directGroup);
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
        return { key: area.key, title: area.title, groups };
      });
  }

  function catalogNeighbors(
    articleKey: string,
    requestedEntryKey?: string,
  ) {
    const article = getArticle(articleKey);
    if (!article) return {};
    const placement = article.catalogPlacements.find(
      (item) => item.key === requestedEntryKey,
    ) ?? article.catalogPlacements[0];
    if (!placement) return {};
    const module = getModules().find(
      (item) => item.key === placement.moduleKey,
    );
    const groups = catalogAreas(
      placement.moduleKey,
      module?.articles ?? [article],
    ).flatMap((area) => area.groups);
    const group = groups.find((item) => (
      requestedEntryKey && item.entryKeys.includes(requestedEntryKey)
    )) ?? groups.find((item) => item.articles.some(
      (candidate) => candidate.articleKey === articleKey,
    ));
    if (!group) return {};
    const route = group.articles.flatMap((candidate, index) => {
      const entryKey = group.entryKeys[index];
      return candidate.exists
        && !["计划", "推迟"].includes(candidate.status)
        && entryKey
        ? [{ article: candidate, entryKey }]
        : [];
    });
    const index = route.findIndex((entry) => requestedEntryKey
      ? entry.entryKey === requestedEntryKey
      : entry.article.articleKey === articleKey);
    return index < 0 ? {} : {
      previous: route[index - 1],
      next: route[index + 1],
    };
  }

  function learningNavigations(articleKey: string): ArticleNavigation[] {
    const article = getArticle(articleKey);
    if (!article) return [];
    return manifest.stages.flatMap((stage) => learningEntries(stage)
      .filter((entry) => entry.article.articleKey === articleKey)
      .map((entry) => ({
        label: "学习路线",
        title: `${stage.number} ${stage.title}`,
        groups: learningGroups(stage),
        activeEntryKey: entry.entryKey,
        ...learningNeighbors(articleKey, entry.entryKey),
      })));
  }

  function catalogNavigations(articleKey: string): ArticleNavigation[] {
    const article = getArticle(articleKey);
    if (!article) return [];
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
      const module = getModules().find(
        (item) => item.key === placement.moduleKey,
      );
      const areas = catalogAreas(
        placement.moduleKey,
        module?.articles ?? [article],
      );
      return {
        label: "模块",
        title: placement.moduleTitle,
        groups: areas.flatMap((area) => area.groups),
        areas,
        activeEntryKey: placement.key,
        ...catalogNeighbors(articleKey, placement.key),
      };
    });
  }

  function learningFallback(
    articleKey: string,
  ): DirectoryReturnTarget | undefined {
    const placement = findLearningPlacement(articleKey);
    const groupKey = placement?.unit?.entryKeys[0];
    if (groupKey) return { kind: "group", key: groupKey };
    if (placement) return { kind: "section", key: placement.stage.key };
    return undefined;
  }

  function catalogFallback(
    articleKey: string,
  ): DirectoryReturnTarget | undefined {
    const article = getArticle(articleKey);
    const navigation = catalogNavigations(articleKey)[0];
    if (!article || !navigation) return undefined;
    const group = navigation.groups.find((candidate) => (
      candidate.entryKeys.includes(navigation.activeEntryKey)
    ));
    if (group?.grouped && group.entryKeys[0]) {
      return { kind: "group", key: group.entryKeys[0] };
    }
    const area = navigation.areas?.find((candidate) => (
      candidate.groups.some((candidateGroup) => (
        candidateGroup.entryKeys.includes(navigation.activeEntryKey)
      ))
    ));
    return area
      ? { kind: "area", key: area.key }
      : { kind: "section", key: article.moduleAnchor };
  }

  return {
    catalogAreas,
    catalogFallback,
    catalogNavigations,
    getArticle,
    getModules,
    learningGroups,
    learningFallback,
    learningNavigations,
  };
}

export function parseArticleLocation(pathname: string): {
  articleKey: string;
  mode: NavigationMode;
} | undefined {
  const parts = pathname.split("/").filter(Boolean);
  if (
    parts.length !== 3
    || !["catalog", "learning-path"].includes(parts[0])
  ) {
    return undefined;
  }
  return {
    articleKey: `${decodeURIComponent(parts[1])}/${decodeURIComponent(parts[2])}`,
    mode: parts[0] as NavigationMode,
  };
}
