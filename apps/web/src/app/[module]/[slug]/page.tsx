import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleNavigation } from "@/components/article-navigation";
import { ArticleNavigationModeSync } from "@/components/article-navigation-mode-sync";
import { ArticleNeighbors } from "@/components/article-neighbors";
import { ArticleTableOfContents } from "@/components/article-table-of-contents";
import { CodeBlockEnhancements } from "@/components/code-block-enhancements";
import { SiteHeader } from "@/components/site-header";
import { getArticle, getArticleLearningNavigation, getArticleLearningNeighbors, getArticleModuleNavigation, getArticleModuleNeighbors, getArticles } from "@/lib/content/catalog";
import { getRenderedArticle } from "@/lib/content/compiled";

interface ArticlePageProps {
  params: Promise<{ module: string; slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles()
    .filter((article) => article.exists && article.status !== "计划")
    .map((article) => ({ module: article.moduleKey, slug: article.articleSlug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { module, slug } = await params;
  const article = getArticle(`${module}/${slug}`);
  return article ? { title: article.title } : {};
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { module, slug } = await params;
  const article = getArticle(`${module}/${slug}`);
  if (!article?.exists || article.status === "计划") {
    notFound();
  }

  const rendered = await getRenderedArticle(article);
  const moduleNavigation = getArticleModuleNavigation(article.articleKey);
  if (!moduleNavigation) {
    notFound();
  }
  const learningNavigation = getArticleLearningNavigation(article.articleKey);
  const moduleNeighbors = getArticleModuleNeighbors(article.articleKey);
  const learningNeighbors = getArticleLearningNeighbors(article.articleKey);

  return (
    <>
      <Suspense fallback={null}>
        <ArticleNavigationModeSync />
      </Suspense>
      <SiteHeader activeSection="article" />
      <div className="docs-layout">
        <ArticleNavigation articleKey={article.articleKey} moduleNavigation={moduleNavigation} learningNavigation={learningNavigation} />

        <main className="article-column">
          <article className="markdown-body" data-article-key={article.articleKey} data-content-revision={rendered.contentRevision} dangerouslySetInnerHTML={{ __html: rendered.html }} />
          <CodeBlockEnhancements articleKey={article.articleKey} />
          <ArticleNeighbors catalog={moduleNeighbors} learn={learningNeighbors} />
        </main>

        <ArticleTableOfContents articleKey={article.articleKey} items={rendered.tableOfContents} />
      </div>
    </>
  );
}
