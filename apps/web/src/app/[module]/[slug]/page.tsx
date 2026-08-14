import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleLink } from "@/components/article-link";
import { SiteHeader } from "@/components/site-header";
import { getArticle, getArticleNeighbors, getArticles, getModules } from "@/lib/content/catalog";
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
  const currentModule = getModules().find((item) => item.key === article.moduleKey);
  const neighbors = getArticleNeighbors(article.articleKey);

  return (
    <>
      <SiteHeader />
      <div className="docs-layout">
        <aside className="module-sidebar" aria-label={`${article.moduleTitle}目录`}>
          <div className="sidebar-heading"><span>模块</span><h2>{article.moduleTitle}</h2></div>
          <nav className="sidebar-list">
            {currentModule?.articles.map((item) => <ArticleLink article={item} active={item.articleKey === article.articleKey} key={item.articleKey} />)}
          </nav>
        </aside>

        <main className="article-column">
          <div className="article-context">
            <Link href="/catalog/">{article.moduleTitle}</Link>
            <span aria-hidden="true">/</span>
            <span>{article.status}</span>
          </div>
          <article className="markdown-body" data-article-key={article.articleKey} data-content-revision={rendered.contentRevision} dangerouslySetInnerHTML={{ __html: rendered.html }} />
          <nav className="article-neighbors" aria-label="学习路线中的相邻文章">
            {neighbors.previous ? <Link href={neighbors.previous.route}><ArrowLeft aria-hidden="true" /><span><small>上一篇</small>{neighbors.previous.title}</span></Link> : <span />}
            {neighbors.next ? <Link className="next" href={neighbors.next.route}><span><small>下一篇</small>{neighbors.next.title}</span><ArrowRight aria-hidden="true" /></Link> : <span />}
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
