import type { Metadata } from "next";

import { ArticleFamilyList } from "@/components/article-family-list";
import { DirectorySidebar } from "@/components/directory-sidebar";
import { IndexingConvention } from "@/components/indexing-convention";
import { SiteHeader } from "@/components/site-header";
import { getLearningStages, getLearningUnitGroups } from "@/lib/content/catalog";

export const metadata: Metadata = { title: "学习路线" };

export default function LearningPathPage() {
  const stages = getLearningStages();

  return (
    <>
      <SiteHeader activeSection="learn" />
      <main className="directory-layout">
        <DirectorySidebar title="学习路线" items={stages.map((stage) => ({ id: stage.key, label: `${stage.key.replace("阶段-", "")} ${stage.title}` }))} />
        <div className="index-page directory-content">
          <header className="page-intro">
            <p className="eyebrow">Learning Path</p>
            <h1>学习路线</h1>
            <p>从 C++ 基础出发，到高中竞赛进阶为止。灰色节点已经规划，但正文尚未完成。</p>
          </header>
          <IndexingConvention />
          <div className="section-stack">
            {stages.map((stage) => {
              return (
                <section className="panel" id={stage.key} key={stage.key}>
                  <div className="panel-header stage-header">
                    <span>{stage.key.replace("阶段-", "")}</span>
                    <h2>{stage.title}</h2>
                  </div>
                  <div className="article-list">
                    <ArticleFamilyList groups={getLearningUnitGroups(stage)} navigation="learn" />
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
