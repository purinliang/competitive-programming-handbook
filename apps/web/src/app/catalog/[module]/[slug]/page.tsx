import type { Metadata } from "next";

import { ArticleExperience } from "@/components/article-experience";
import { getArticle, getArticles } from "@/lib/content/catalog";

interface CatalogArticlePageProps {
  params: Promise<{ module: string; slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles()
    .filter((article) => article.exists && article.status !== "计划")
    .map((article) => ({ module: article.moduleKey, slug: article.articleSlug }));
}

export async function generateMetadata({ params }: CatalogArticlePageProps): Promise<Metadata> {
  const { module, slug } = await params;
  const article = getArticle(`${module}/${slug}`);
  return article ? { title: `${article.kind === "extension" ? "*" : ""}${article.title}` } : {};
}

export default async function CatalogArticlePage({ params }: CatalogArticlePageProps) {
  const { module, slug } = await params;
  return <ArticleExperience articleKey={`${module}/${slug}`} mode="catalog" />;
}
