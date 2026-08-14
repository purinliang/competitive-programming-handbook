import { ArrowRight, BookOpen, GraduationCap, Layers3 } from "lucide-react";
import Link from "next/link";

import { ArticleLink } from "@/components/article-link";
import { SiteHeader } from "@/components/site-header";
import { getArticle, getArticles, getLearningStages } from "@/lib/content/catalog";

export default function HomePage() {
  const stages = getLearningStages();
  const articles = getArticles();
  const availableCount = articles.filter((article) => article.exists).length;
  const firstArticles = stages[0]?.articleKeys.slice(0, 5).map(getArticle).filter(Boolean) ?? [];

  return (
    <>
      <SiteHeader />
      <main className="landing-page page-frame">
        <section className="hero-panel">
          <p className="eyebrow">Competitive Programming Handbook</p>
          <h1>把每一行代码，变成可以重新推导的知识。</h1>
          <p className="hero-description">
            从 C++ 基础到高中竞赛进阶，沿着一条能真正读完的路线学习；也可以按模块查找算法、数据结构和可复制模板。
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/learn/">
              开始学习 <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="secondary-button" href="/catalog/">浏览全部模块</Link>
          </div>
        </section>

        <section className="summary-grid" aria-label="知识库概况">
          <div className="summary-item"><BookOpen aria-hidden="true" /><strong>{availableCount}</strong><span>篇已有正文</span></div>
          <div className="summary-item"><GraduationCap aria-hidden="true" /><strong>{stages.length}</strong><span>个学习阶段</span></div>
          <div className="summary-item"><Layers3 aria-hidden="true" /><strong>{new Set(articles.map((item) => item.moduleKey)).size}</strong><span>个知识模块</span></div>
        </section>

        <section className="panel getting-started">
          <div className="panel-header">
            <div><h2>从第一阶段开始</h2><p>这里先建立写程序所需的 C++ 基础。</p></div>
            <Link href="/learn/">查看完整路线</Link>
          </div>
          <div className="article-list">
            {firstArticles.map((article) => article && <ArticleLink article={article} key={article.articleKey} />)}
          </div>
        </section>
      </main>
    </>
  );
}
