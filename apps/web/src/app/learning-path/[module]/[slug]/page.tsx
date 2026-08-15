import type { Metadata } from "next";

import { ArticleExperience } from "@/components/article-experience";
import { getArticle, getLearningArticles } from "@/lib/content/catalog";

interface LearningArticlePageProps {
  params: Promise<{ module: string; slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getLearningArticles()
    .filter((article) => article.exists && article.status !== "计划")
    .map((article) => ({ module: article.moduleKey, slug: article.articleSlug }));
}

export async function generateMetadata({ params }: LearningArticlePageProps): Promise<Metadata> {
  const { module, slug } = await params;
  const article = getArticle(`${module}/${slug}`);
  return article ? { title: article.title } : {};
}

export default async function LearningArticlePage({ params }: LearningArticlePageProps) {
  const { module, slug } = await params;
  return <ArticleExperience articleKey={`${module}/${slug}`} mode="learning-path" />;
}
