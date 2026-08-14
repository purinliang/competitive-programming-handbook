import type { Metadata } from "next";

import { ArticleLink } from "@/components/article-link";
import { SiteHeader } from "@/components/site-header";
import { getModules } from "@/lib/content/catalog";

export const metadata: Metadata = { title: "模块目录" };

export default function CatalogPage() {
  const modules = getModules();

  return (
    <>
      <SiteHeader />
      <main className="index-page page-frame">
        <header className="page-intro">
          <p className="eyebrow">Catalog</p>
          <h1>按模块浏览</h1>
          <p>目录负责完整收录知识点；学习顺序请使用学习路线。</p>
        </header>
        <div className="section-stack">
          {modules.map((module) => (
            <section className="panel" id={module.anchor} key={module.key}>
              <div className="panel-header"><h2>{module.title}</h2><span>{module.articles.length} 个知识点</span></div>
              <div className="article-list">
                {module.articles.map((article) => <ArticleLink article={article} key={article.articleKey} />)}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
