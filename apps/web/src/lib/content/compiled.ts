import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ArticleRecord, RenderedArticle } from "./types";

const ARTICLE_CACHE_ROOT = path.join(process.cwd(), ".content-cache/articles");

export async function getRenderedArticle(article: ArticleRecord): Promise<RenderedArticle> {
  const cachePath = path.join(ARTICLE_CACHE_ROOT, `${article.articleKey}.json`);
  return JSON.parse(await readFile(cachePath, "utf8")) as RenderedArticle;
}
