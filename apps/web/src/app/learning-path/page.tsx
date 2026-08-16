import type { Metadata } from "next";
import { Suspense } from "react";

import { ArticleFamilyList } from "@/components/article-family-list";
import { ContextPreservingSiteHeader } from "@/components/context-preserving-site-header";
import { DirectorySidebar } from "@/components/directory-sidebar";
import { IndexingConvention } from "@/components/indexing-convention";
import { NumberedPanelHeader } from "@/components/numbered-panel-header";
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
      <main className="directory-layout">
        <DirectorySidebar title="学习路线" items={stages.map((stage) => ({ id: stage.key, label: `${stage.number} ${stage.title}` }))} />
        <div className="index-page directory-content">
          <header className="page-intro">
            <p className="eyebrow">Learning Path</p>
            <h1>学习路线</h1>
            <p>按前置关系组织学习单元，适合从头学习、逐步建立解题能力。</p>
          </header>
          <IndexingConvention />
          <div className="section-stack">
            {stages.map((stage) => {
              return (
                <section className="panel" id={stage.key} key={stage.key}>
                  <NumberedPanelHeader label={`${stage.number} ${stage.title}`} />
                  <div className="article-list">
                    <ArticleFamilyList groups={getLearningUnitGroups(stage)} navigation="learning-path" />
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
