import { BookOpen } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/">
          <BookOpen aria-hidden="true" size={20} />
          <span>算法竞赛手册</span>
        </Link>
        <nav className="site-nav" aria-label="主导航">
          <Link href="/learn/">学习路线</Link>
          <Link href="/catalog/">模块目录</Link>
          <Link href="/search/">搜索</Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
