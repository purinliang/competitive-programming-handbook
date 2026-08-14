import { BookOpen } from "lucide-react";
import Link from "next/link";

type HeaderSection = "learn" | "catalog" | "search";

interface SiteHeaderProps {
  activeSection?: HeaderSection;
}

export function SiteHeader({ activeSection }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/">
          <BookOpen aria-hidden="true" size={20} />
          <span>算法竞赛手册</span>
        </Link>
        <nav className="site-nav" aria-label="主导航">
          <Link className={activeSection === "learn" ? "is-active" : undefined} href="/learn/">学习路线</Link>
          <Link className={activeSection === "catalog" ? "is-active" : undefined} href="/catalog/">模块目录</Link>
          <Link className={activeSection === "search" ? "is-active" : undefined} href="/search/">搜索</Link>
        </nav>
      </div>
    </header>
  );
}
