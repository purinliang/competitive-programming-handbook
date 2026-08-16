import { Book } from "lucide-react";

import { AccountControl } from "./account-control";
import { NavigationLink as Link } from "./navigation-link";

type HeaderSection = "learning-path" | "catalog" | "search";

interface SiteHeaderProps {
  activeSection?: HeaderSection;
  catalogHref?: string;
  learningPathHref?: string;
  searchHref?: string;
}

export function SiteHeader({
  activeSection,
  catalogHref = "/catalog/",
  learningPathHref = "/learning-path/",
  searchHref = "/search/",
}: SiteHeaderProps) {
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
          <Link
            className={linkClass("learning-path")}
            href={learningPathHref}
            scroll={!learningPathHref.includes("article=")}
          >学习路线</Link>
          <Link
            className={linkClass("catalog")}
            href={catalogHref}
            scroll={!catalogHref.includes("article=")}
          >模块目录</Link>
          <Link className={linkClass("search")} href={searchHref}>搜索</Link>
        </nav>
        <AccountControl />
      </div>
    </header>
  );
}
