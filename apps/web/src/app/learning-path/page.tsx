import type { Metadata } from "next";
import { Suspense } from "react";

import { ArticleFamilyList } from "@/components/article-family-list";
import { ContextPreservingSiteHeader } from "@/components/context-preserving-site-header";
import { DirectoryPageShell } from "@/components/directory-page-shell";
import { DirectorySection } from "@/components/directory-section";
import { SiteHeader } from "@/components/site-header";
import {
  getLearningStages,
  getLearningUnitGroups,
} from "@/lib/content/catalog";

export const metadata: Metadata = { title: "学习路线" };

export default function LearningPathPage() {
  const stages = getLearningStages();

  return (
    <>
      <Suspense fallback={<SiteHeader activeSection="learning-path" />}>
        <ContextPreservingSiteHeader activeSection="learning-path" />
      </Suspense>
      <DirectoryPageShell
        description="按前置关系组织学习单元，适合从头学习、逐步建立解题能力。"
        eyebrow="Learning Path"
        sidebarItems={stages.map((stage) => ({
          id: stage.key,
          label: `${stage.number} ${stage.title}`,
        }))}
        title="学习路线"
      >
        {stages.map((stage) => (
          <DirectorySection
            id={stage.key}
            key={stage.key}
            label={`${stage.number} ${stage.title}`}
          >
            <ArticleFamilyList
              groups={getLearningUnitGroups(stage)}
              navigation="learning-path"
            />
          </DirectorySection>
        ))}
      </DirectoryPageShell>
    </>
  );
}
