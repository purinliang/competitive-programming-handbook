import type { Metadata } from "next";
import { Suspense } from "react";

import { ContextPreservingSiteHeader } from "@/components/context-preserving-site-header";
import { PageIntro } from "@/components/page-intro";
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
          <PageIntro
            description="搜索文章标题、正文、变量名和算法名称。"
            eyebrow="Search"
            title="搜索"
          />
          <SearchExperience />
        </div>
      </main>
    </>
  );
}
