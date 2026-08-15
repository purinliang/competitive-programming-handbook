import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

import { SearchExperience } from "./search-experience";

export const metadata: Metadata = { title: "搜索" };

export default function SearchPage() {
  return (
    <>
      <SiteHeader activeSection="search" />
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
