import type { Metadata } from "next";

import { ArticleFamilyList } from "@/components/article-family-list";
import { DirectorySidebar } from "@/components/directory-sidebar";
import { SiteHeader } from "@/components/site-header";
import { getLearningStages, getLearningUnitGroups } from "@/lib/content/catalog";

export const metadata: Metadata = { title: "学习路线" };

export default function LearningPathPage() {
  const stages = getLearningStages();

  return (
    <>
      <SiteHeader activeSection="learn" />
      <main className="directory-layout">
        <DirectorySidebar title="学习路线" items={stages.map((stage, index) => ({ id: stage.key, label: `${index + 1}. ${stage.title}` }))} />
        <div className="index-page directory-content">
          <header className="page-intro">
            <p className="eyebrow">Learning Path</p>
            <h1>学习路线</h1>
            <p>从 C++ 基础出发，到高中竞赛进阶为止。灰色节点已经规划，但正文尚未完成。</p>
          </header>
          <aside className="route-convention" aria-label="下标与区间约定">
            <strong>下标与区间约定</strong>
            <p>本书自己定义的对象默认使用从 1 开始的下标和闭区间；直接讲解 C++ 与 STL 接口时保留它们原生的从 0 开始和半开区间规则。</p>
          </aside>
          <div className="section-stack">
            {stages.map((stage, index) => {
              return (
                <section className="panel" id={stage.key} key={stage.key}>
                  <div className="panel-header stage-header">
                    <span>{String(index + 1).padStart(2, "0")}</span>
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
