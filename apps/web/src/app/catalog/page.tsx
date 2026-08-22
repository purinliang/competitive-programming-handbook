import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogAreaList } from "@/components/catalog-area-list";
import { ContextPreservingSiteHeader } from "@/components/context-preserving-site-header";
import { DirectoryPageShell } from "@/components/directory-page-shell";
import { DirectorySection } from "@/components/directory-section";
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
      <DirectoryPageShell
        description="按知识领域组织核心与扩展专题，适合快速查找、集中复习某类知识。"
        eyebrow="Catalog"
        sidebarItems={modules.map((module) => ({
          id: module.anchor,
          label: module.title,
        }))}
        title="模块目录"
      >
        {modules.map((module) => (
          <DirectorySection
            detail={`${module.articles.length} 个知识点`}
            id={module.anchor}
            key={module.key}
            label={module.title}
          >
            <CatalogAreaList
              areas={getCatalogAreas(module.key, module.articles)}
              navigation="catalog"
            />
          </DirectorySection>
        ))}
      </DirectoryPageShell>
    </>
  );
}
