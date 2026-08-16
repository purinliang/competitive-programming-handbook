import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogAreaList } from "@/components/catalog-area-list";
import { ContextPreservingSiteHeader } from "@/components/context-preserving-site-header";
import { DirectoryEntryRestorer } from "@/components/directory-entry-restorer";
import { DirectorySidebar } from "@/components/directory-sidebar";
import { IndexingConvention } from "@/components/indexing-convention";
import { NumberedPanelHeader } from "@/components/numbered-panel-header";
import { SiteHeader } from "@/components/site-header";
import { getCatalogAreas, getModules } from "@/lib/content/catalog";

export const metadata: Metadata = { title: "模块目录" };

export default function CatalogPage() {
  const modules = getModules();

  return (
    <>
      <Suspense fallback={<SiteHeader activeSection="catalog" />}>
        <ContextPreservingSiteHeader activeSection="catalog" />
      </Suspense>
      <main className="directory-layout">
        <Suspense fallback={null}>
          <DirectoryEntryRestorer />
        </Suspense>
        <DirectorySidebar title="模块目录" items={modules.map((module) => ({ id: module.anchor, label: module.title }))} />
        <div className="index-page directory-content">
          <header className="page-intro">
            <p className="eyebrow">Catalog</p>
            <h1>模块目录</h1>
            <p>按知识领域组织核心与扩展专题，适合快速查找、集中复习某类知识。</p>
          </header>
          <IndexingConvention />
          <div className="section-stack">
            {modules.map((module) => (
              <section className="panel" id={module.anchor} key={module.key}>
                <NumberedPanelHeader label={module.title} detail={`${module.articles.length} 个知识点`} />
                <div className="article-list">
                  <CatalogAreaList
                    areas={getCatalogAreas(module.key, module.articles)}
                    navigation="catalog"
                  />
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
