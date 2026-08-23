import type { Metadata } from "next";
import { Suspense } from "react";

import { ContextPreservingSiteHeader } from "@/components/context-preserving-site-header";
import { RuntimeDirectoryExperience } from "@/components/runtime-directory-experience";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "学习路线" };

export default function LearningPathPage() {
  return (
    <>
      <Suspense fallback={<SiteHeader activeSection="learning-path" />}>
        <ContextPreservingSiteHeader activeSection="learning-path" />
      </Suspense>
      <RuntimeDirectoryExperience mode="learning-path" />
    </>
  );
}
