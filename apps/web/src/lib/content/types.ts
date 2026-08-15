export type ArticleStatus = "计划" | "待审阅" | "已审阅" | "草稿" | "定稿";
export type NavigationMode = "learning-path" | "catalog";

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
  learningSourcePath: string;
  catalogRoute: string;
  learningPathRoute: string;
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

export interface LearningQuestionOption {
  id: string;
  text: string;
}

export interface LearningQuestion {
  id: string;
  prompt: string;
  options: LearningQuestionOption[];
  correctOptionId: string;
  explanation: string;
}

export interface LearningQuiz {
  revision: string;
  questions: LearningQuestion[];
}
