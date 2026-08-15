import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="empty-page page-frame">
        <p className="eyebrow">404</p>
        <h1>这一页还不存在</h1>
        <p>它可能仍在计划中，也可能已经移动到了新的模块。</p>
        <Link className="primary-button" href="/">返回首页</Link>
      </main>
    </>
  );
}
