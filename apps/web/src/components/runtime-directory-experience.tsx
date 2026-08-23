"use client";

import { useEffect, useState } from "react";

import { ArticleFamilyList } from "./article-family-list";
import { Button } from "./button";
import { CatalogAreaList } from "./catalog-area-list";
import { DirectoryPageShell } from "./directory-page-shell";
import { DirectorySection } from "./directory-section";
import { StateMessage } from "./state-message";

import {
  createRuntimeCatalog,
  getRuntimeNavigationManifest,
} from "@/lib/content/runtime-data";

import type { ContentManifest, NavigationMode } from "@/lib/content/types";

const pageCopy = {
  catalog: {
    description: "按知识领域组织核心与扩展专题，适合快速查找、集中复习某类知识。",
    eyebrow: "Catalog",
    title: "模块目录",
  },
  "learning-path": {
    description: "按前置关系组织学习单元，适合从头学习、逐步建立解题能力。",
    eyebrow: "Learning Path",
    title: "学习路线",
  },
} satisfies Record<NavigationMode, {
  description: string;
  eyebrow: string;
  title: string;
}>;

export function RuntimeDirectoryExperience({
  mode,
}: {
  mode: NavigationMode;
}) {
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState(false);
  const [manifest, setManifest] = useState<ContentManifest>();

  useEffect(() => {
    let cancelled = false;
    setError(false);
    void getRuntimeNavigationManifest()
      .then((result) => {
        if (!cancelled) setManifest(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const copy = pageCopy[mode];
  if (!manifest) {
    return (
      <DirectoryPageShell
        description={copy.description}
        eyebrow={copy.eyebrow}
        sidebarItems={[]}
        title={copy.title}
      >
        <StateMessage role="status">
          {error ? "目录暂时无法读取。" : "正在读取目录。"}
        </StateMessage>
        {error ? (
          <Button onClick={() => setAttempt((value) => value + 1)}>
            重新读取
          </Button>
        ) : null}
      </DirectoryPageShell>
    );
  }

  const catalog = createRuntimeCatalog(manifest);
  if (mode === "learning-path") {
    return (
      <DirectoryPageShell
        description={copy.description}
        eyebrow={copy.eyebrow}
        sidebarItems={manifest.stages.map((stage) => ({
          id: stage.key,
          label: `${stage.number} ${stage.title}`,
        }))}
        title={copy.title}
      >
        {manifest.stages.map((stage) => (
          <DirectorySection
            id={stage.key}
            key={stage.key}
            label={`${stage.number} ${stage.title}`}
          >
            <ArticleFamilyList
              groups={catalog.learningGroups(stage)}
              navigation="learning-path"
            />
          </DirectorySection>
        ))}
      </DirectoryPageShell>
    );
  }

  const modules = catalog.getModules();
  return (
    <DirectoryPageShell
      description={copy.description}
      eyebrow={copy.eyebrow}
      sidebarItems={modules.map((module) => ({
        id: module.anchor,
        label: module.title,
      }))}
      title={copy.title}
    >
      {modules.map((module) => (
        <DirectorySection
          detail={`${module.articles.length} 个知识点`}
          id={module.anchor}
          key={module.key}
          label={module.title}
        >
          <CatalogAreaList
            areas={catalog.catalogAreas(module.key, module.articles)}
            navigation="catalog"
          />
        </DirectorySection>
      ))}
    </DirectoryPageShell>
  );
}
