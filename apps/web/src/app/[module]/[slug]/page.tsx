import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleNavigation } from "@/components/article-navigation";
import { ArticleNavigationView } from "@/components/article-navigation-view";
import { ArticleNeighbors } from "@/components/article-neighbors";
import { ArticleNeighborsView } from "@/components/article-neighbors-view";
import { ArticleSiteHeader } from "@/components/article-site-header";
import { ScrollArea } from "@/components/scroll-area";
import { SiteHeader } from "@/components/site-header";
import { getArticle, getArticleLearningNavigation, getArticleLearningNeighbors, getArticleModuleNavigation, getArticleModuleNeighbors, getArticles, getLearningStages, getModules } from "@/lib/content/catalog";
import { renderArticle } from "@/lib/content/markdown";

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

  const rendered = await renderArticle(article);
  const moduleNavigation = getArticleModuleNavigation(article.articleKey);
  if (!moduleNavigation) {
    notFound();
  }
  const learningNavigation = getArticleLearningNavigation(article.articleKey);
  const moduleNeighbors = getArticleModuleNeighbors(article.articleKey);
  const learningNeighbors = getArticleLearningNeighbors(article.articleKey);
  const stage = getLearningStages().find((item) => item.articleKeys.includes(article.articleKey));
  const catalogHeaderNavigation = getModules().map((item) => ({
    href: `/catalog/#${item.anchor}`,
    label: item.title,
    active: item.key === article.moduleKey,
  }));
  const learningHeaderNavigation = stage ? getLearningStages().map((item, index) => ({
    href: `/learn/#${item.key}`,
    label: `${index + 1}. ${item.title}`,
    active: item.key === stage.key,
  })) : undefined;

  return (
    <>
      <Suspense fallback={<SiteHeader activeSection="catalog" secondaryNavigation={catalogHeaderNavigation} />}>
        <ArticleSiteHeader catalogNavigation={catalogHeaderNavigation} learningNavigation={learningHeaderNavigation} />
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

        <aside className="toc-sidebar" aria-label="本文目录">
          <div className="sidebar-heading"><span>文章</span><h2>本文目录</h2></div>
          <ScrollArea className="sidebar-scroll-area" viewportClassName="sidebar-scroll-viewport" refreshKey={article.articleKey}>
            <nav className="toc-list">
              {rendered.tableOfContents.map((item) => <a className={item.depth === 3 ? "toc-depth-3" : undefined} href={`#${item.id}`} key={item.id}>{item.title}</a>)}
            </nav>
          </ScrollArea>
        </aside>
      </div>
    </>
  );
}
