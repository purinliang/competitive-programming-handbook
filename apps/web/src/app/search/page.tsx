import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

import { SearchExperience } from "./search-experience";

export const metadata: Metadata = { title: "搜索" };

export default function SearchPage() {
  return (
    <>
      <SiteHeader activeSection="search" />
      <main className="index-page page-frame search-page">
        <header className="page-intro">
          <p className="eyebrow">Search</p>
          <h1>搜索知识库</h1>
          <p>搜索文章标题、正文、变量名和算法名称。</p>
        </header>
        <SearchExperience />
      </main>
    </>
  );
}
