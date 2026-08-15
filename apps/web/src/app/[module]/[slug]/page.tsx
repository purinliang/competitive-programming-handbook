import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleNavigation } from "@/components/article-navigation";
import { ArticleNavigationView } from "@/components/article-navigation-view";
import { ArticleNeighbors } from "@/components/article-neighbors";
import { ArticleNeighborsView } from "@/components/article-neighbors-view";
import { ArticleSiteHeader } from "@/components/article-site-header";
import { ArticleTableOfContents } from "@/components/article-table-of-contents";
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
      <Suspense fallback={<SiteHeader activeSection="catalog" />}>
        <ArticleSiteHeader />
      </Suspense>
      <div className="docs-layout">
        <Suspense fallback={<ArticleNavigationView articleKey={article.articleKey} mode="catalog" navigation={moduleNavigation} />}>
          <ArticleNavigation articleKey={article.articleKey} moduleNavigation={moduleNavigation} learningNavigation={learningNavigation} />
        </Suspense>

        <main className="article-column">
          <div className="article-context">
            <Link href="/catalog/">{article.moduleTitle}</Link>
            <span aria-hidden="true">/</span>
            <span>{article.status}</span>
          </div>
          <article className="markdown-body" data-article-key={article.articleKey} data-content-revision={rendered.contentRevision} dangerouslySetInnerHTML={{ __html: rendered.html }} />
          <Suspense fallback={<ArticleNeighborsView mode="catalog" {...moduleNeighbors} />}>
            <ArticleNeighbors catalog={moduleNeighbors} learn={learningNeighbors} />
          </Suspense>
        </main>

        <ArticleTableOfContents articleKey={article.articleKey} items={rendered.tableOfContents} />
      </div>
    </>
  );
}
