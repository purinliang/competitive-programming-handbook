import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ArticleRecord, LearningQuiz, NavigationMode, RenderedArticle } from "./types";

const ARTICLE_CACHE_ROOT = path.join(process.cwd(), ".content-cache/articles");

export async function getRenderedArticle(article: ArticleRecord, mode: NavigationMode): Promise<RenderedArticle> {
  const cachePath = path.join(ARTICLE_CACHE_ROOT, mode, `${article.articleKey}.json`);
  return JSON.parse(await readFile(cachePath, "utf8")) as RenderedArticle;
}

export async function getLearningQuiz(article: ArticleRecord): Promise<LearningQuiz | undefined> {
  const cachePath = path.join(process.cwd(), ".content-cache/quizzes", `${article.articleKey}.json`);
  try {
    return JSON.parse(await readFile(cachePath, "utf8")) as LearningQuiz;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}
