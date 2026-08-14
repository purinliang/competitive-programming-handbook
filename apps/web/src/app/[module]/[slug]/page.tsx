import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleLink } from "@/components/article-link";
import { SiteHeader } from "@/components/site-header";
import { getArticle, getArticleNavigation, getArticleNeighbors, getArticles } from "@/lib/content/catalog";
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
  const articleNavigation = getArticleNavigation(article.articleKey);
  const neighbors = getArticleNeighbors(article.articleKey);

  return (
    <>
      <SiteHeader />
      <div className="docs-layout">
        <aside className="module-sidebar" aria-label={`${article.moduleTitle}目录`}>
          <div className="sidebar-heading"><span>{articleNavigation?.label}</span><h2>{articleNavigation?.title}</h2></div>
          <nav className="sidebar-list">
            {articleNavigation?.groups.map((group) => (
              group.articles.length === 1 && group.articles[0].title === group.title
                ? <ArticleLink article={group.articles[0]} active={group.active} key={group.title} />
                : <details className="sidebar-group" open={group.active} key={group.title}>
                <summary><span>{group.title}</span><small>{group.articles.length}</small></summary>
                <div>
                  {group.articles.map((item) => <ArticleLink article={item} active={item.articleKey === article.articleKey} label={item.title.slice(item.title.indexOf("：") + 1)} key={item.articleKey} />)}
                </div>
              </details>
            ))}
          </nav>
          {articleNavigation ? <nav className="sidebar-footer" aria-label="更多导航">
            <Link href={articleNavigation.primaryRoute}>{articleNavigation.primaryLabel}</Link>
            <Link href={articleNavigation.secondaryRoute}>{articleNavigation.secondaryLabel}</Link>
          </nav> : null}
        </aside>

        <main className="article-column">
          <div className="article-context">
            <Link href="/catalog/">{article.moduleTitle}</Link>
            <span aria-hidden="true">/</span>
            <span>{article.status}</span>
          </div>
          <article className="markdown-body" data-article-key={article.articleKey} data-content-revision={rendered.contentRevision} dangerouslySetInnerHTML={{ __html: rendered.html }} />
          <nav className="article-neighbors" aria-label="学习路线中的相邻文章">
            {neighbors.previous ? <Link href={neighbors.previous.route}><ArrowLeft aria-hidden="true" /><span><small>上一篇</small>{neighbors.previous.title}</span></Link> : <span className="article-neighbor-disabled" aria-disabled="true"><ArrowLeft aria-hidden="true" /><span><small>上一篇</small>没有更早的文章</span></span>}
            {neighbors.next ? <Link className="next" href={neighbors.next.route}><span><small>下一篇</small>{neighbors.next.title}</span><ArrowRight aria-hidden="true" /></Link> : <span className="article-neighbor-disabled next" aria-disabled="true"><span><small>下一篇</small>已经到达路线末尾</span><ArrowRight aria-hidden="true" /></span>}
          </nav>
        </main>

        <aside className="toc-sidebar">
          <p>本文目录</p>
          <nav>
            {rendered.tableOfContents.map((item) => <a className={item.depth === 3 ? "toc-depth-3" : undefined} href={`#${item.id}`} key={item.id}>{item.title}</a>)}
          </nav>
        </aside>
      </div>
    </>
  );
}
