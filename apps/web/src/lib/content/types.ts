export type ArticleStatus = "计划" | "待审阅" | "已审阅" | "草稿" | "定稿";

export interface ArticleRecord {
  articleKey: string;
  articleSlug: string;
  catalogId: string;
  title: string;
  status: ArticleStatus;
  kind: "core" | "extension";
  moduleKey: string;
  moduleTitle: string;
  moduleAnchor: string;
  sourcePath: string;
  route: string;
  exists: boolean;
}

export interface ModuleRecord {
  key: string;
  title: string;
  anchor: string;
  articles: ArticleRecord[];
}

export interface LearningStage {
  key: string;
  number: string;
  title: string;
  articleKeys: string[];
  units: LearningUnit[];
}

export interface LearningUnit {
  title: string;
  articleKeys: string[];
}

export interface ArticleFamily {
  title: string;
  articles: ArticleRecord[];
  grouped: boolean;
  continued: boolean;
}

export interface ArticleNavigation {
  label: string;
  title: string;
  groups: ArticleFamily[];
}

export interface TableOfContentsItem {
  depth: 2 | 3;
  id: string;
  title: string;
}

export interface RenderedArticle {
  html: string;
  contentRevision: string;
  tableOfContents: TableOfContentsItem[];
}
