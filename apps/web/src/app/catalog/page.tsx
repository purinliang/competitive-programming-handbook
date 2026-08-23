import type { Metadata } from "next";
import { Suspense } from "react";

import { ContextPreservingSiteHeader } from "@/components/context-preserving-site-header";
import { RuntimeDirectoryExperience } from "@/components/runtime-directory-experience";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "模块目录" };

export default function CatalogPage() {
  return (
    <>
      <Suspense fallback={<SiteHeader activeSection="catalog" />}>
        <ContextPreservingSiteHeader activeSection="catalog" />
      </Suspense>
      <RuntimeDirectoryExperience mode="catalog" />
    </>
  );
}
