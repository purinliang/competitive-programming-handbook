export type ArticleStatus = "计划" | "待审阅" | "已审阅" | "草稿" | "定稿";
export type NavigationMode = "learning-path" | "catalog";

export interface ArticleRecord {
  articleKey: string;
  articleSlug: string;
  catalogId: string;
  title: string;
  learningTitle: string;
  catalogFamilyTitle?: string;
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
  kind: "core" | "extension";
  articleKeys: string[];
}

export interface ArticleFamily {
  title: string;
  articles: ArticleRecord[];
  grouped: boolean;
  continued: boolean;
  stripTitlePrefix: boolean;
}

export interface ArticleNavigation {
  label: string;
  title: string;
  groups: ArticleFamily[];
}

export interface TableOfContentsItem {
  depth: 2 | 3;
  id: string;
  sectionId?: string;
  sectionRevision?: string;
  supplement?: boolean;
  title: string;
}

export interface ArticleSection {
  explicit: boolean;
  id: string;
  legacyIds: string[];
  revision: string;
  title: string;
  quotedText: string;
}

export interface RenderedArticle {
  html: string;
  contentRevision: string;
  documentEpoch: number;
  sections: ArticleSection[];
  tableOfContents: TableOfContentsItem[];
}

export interface LearningQuestionOption {
  id: string;
  text: string;
  textHtml: string;
}

export interface LearningQuestion {
  id: string;
  revision: string;
  prompt: string;
  promptHtml: string;
  options: LearningQuestionOption[];
  correctOptionId: string;
  explanation: string;
  explanationHtml: string;
}

export interface LearningQuiz {
  revision: string;
  questions: LearningQuestion[];
}
