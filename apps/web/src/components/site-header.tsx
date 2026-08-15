import { Book } from "lucide-react";

import { NavigationLink as Link } from "./navigation-link";

type HeaderSection = "learn" | "catalog" | "search";

interface SiteHeaderProps {
  activeSection?: HeaderSection;
}

export function SiteHeader({ activeSection }: SiteHeaderProps) {
  function linkClass(section: Exclude<HeaderSection, "article">) {
    if (activeSection === section) {
      return "is-active";
    }
    return undefined;
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/">
          <Book aria-hidden="true" size={20} />
          <span>算法竞赛手册</span>
        </Link>
        <nav className="site-nav" aria-label="主导航">
          <Link className={linkClass("learn")} href="/learn/">学习路线</Link>
          <Link className={linkClass("catalog")} href="/catalog/">模块目录</Link>
          <Link className={linkClass("search")} href="/search/">搜索</Link>
        </nav>
      </div>
    </header>
  );
}
