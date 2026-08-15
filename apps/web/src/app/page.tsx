import { ArrowRight } from "lucide-react";

import { NavigationLink as Link } from "@/components/navigation-link";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="landing-page page-frame">
        <section className="hero-panel">
          <p className="eyebrow">Competitive Programming Handbook</p>
          <h1>算法竞赛手册</h1>
          <p className="hero-tagline">把每一行代码，变成可以重新推导的知识。</p>
          <p className="hero-description">
            从 C++ 基础到高中竞赛进阶，沿着一条能真正读完的路线学习；也可以按模块查找算法、数据结构和可复制模板。
          </p>
          <div className="hero-actions">
            <Link className="control-button primary-button hero-primary-action" href="/learning-path/">
              开始学习 <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
