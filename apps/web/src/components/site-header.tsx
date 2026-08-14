import { BookOpen } from "lucide-react";
import Link from "next/link";

type HeaderSection = "learn" | "catalog" | "search";

interface SecondaryNavigationItem {
  href: string;
  label: string;
}

export function SiteHeader({ activeSection, secondaryNavigation }: { activeSection?: HeaderSection; secondaryNavigation?: SecondaryNavigationItem[] }) {
  return (
    <header className={`site-header${secondaryNavigation?.length ? " has-secondary-nav" : ""}`}>
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
      {secondaryNavigation?.length ? (
        <nav className="secondary-nav" aria-label={activeSection === "learn" ? "学习阶段" : "知识模块"}>
          <div className="secondary-nav-inner">
            {secondaryNavigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
