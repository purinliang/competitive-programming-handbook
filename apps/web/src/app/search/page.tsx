import type { Metadata } from "next";
import { Suspense } from "react";

import { ContextPreservingSiteHeader } from "@/components/context-preserving-site-header";
import { SiteHeader } from "@/components/site-header";

import { SearchExperience } from "./search-experience";

export const metadata: Metadata = { title: "搜索" };

export default function SearchPage() {
  return (
    <>
      <Suspense fallback={<SiteHeader activeSection="search" />}>
        <ContextPreservingSiteHeader activeSection="search" />
      </Suspense>
      <main className="search-layout">
        <div className="index-page search-page">
          <header className="page-intro">
            <p className="eyebrow">Search</p>
            <h1>搜索</h1>
            <p>搜索文章标题、正文、变量名和算法名称。</p>
          </header>
          <SearchExperience />
        </div>
      </main>
    </>
  );
}
