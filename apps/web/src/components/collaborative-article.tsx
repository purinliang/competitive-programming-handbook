"use client";

import { MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DiscussionPanel } from "./discussion-panel";

import type { DiscussionTarget } from "./discussion-panel";
import type { ArticleSection } from "@/lib/content/types";

const STORAGE_KEY = "handbook.section-progress.v1";

interface StoredSection {
  readAt: number;
  revision: string;
}

type StoredProgress = Record<string, Record<string, StoredSection>>;

function readLocalProgress(documentKey: string, sections: ArticleSection[]) {
  try {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as StoredProgress;
    const current = new Map(sections.map((section) => [section.id, section.revision]));
    return Object.fromEntries(Object.entries(progress[documentKey] ?? {}).flatMap(
      ([sectionId, value]) => current.get(sectionId) === value.revision
        ? [[sectionId, true]]
        : [],
    ));
  } catch {
    return {};
  }
}

function writeLocalProgress(
  documentKey: string,
  sections: ArticleSection[],
  readSections: Record<string, boolean>,
) {
  try {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as StoredProgress;
    progress[documentKey] = Object.fromEntries(sections.flatMap((section) => (
      readSections[section.id]
        ? [[section.id, { readAt: Date.now(), revision: section.revision }]]
        : []
    )));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 禁用本地存储时，当前页面中的操作仍然可用。
  }
}

export function CollaborativeArticle({
  articleKey,
  contentRevision,
  sections,
}: {
  articleKey: string;
  contentRevision: string;
  sections: ArticleSection[];
}) {
  const documentKey = `learning-path:${articleKey}`;
  const [activeTarget, setActiveTarget] = useState<DiscussionTarget>();
  const [readSections, setReadSections] = useState<Record<string, boolean>>({});
  const sectionMap = useMemo(
    () => new Map(sections.map((section) => [section.id, section])),
    [sections],
  );

  useEffect(() => {
    const local = readLocalProgress(documentKey, sections);
    setReadSections(local);
    fetch(`/api/learning/state?document_key=${encodeURIComponent(documentKey)}`, {
      credentials: "include",
    })
      .then((response) => response.ok ? response.json() : undefined)
      .then((state) => {
        if (!state?.sections) return;
        const cloud = Object.fromEntries(state.sections.flatMap((record: {
          sectionId: string;
          sectionRevision: string;
        }) => sectionMap.get(record.sectionId)?.revision === record.sectionRevision
          ? [[record.sectionId, true]]
          : []));
        const merged = { ...cloud, ...local };
        setReadSections(merged);
        writeLocalProgress(documentKey, sections, merged);
      })
      .catch(() => undefined);
  }, [documentKey, sectionMap, sections]);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(
      `.markdown-body[data-article-key="${articleKey}"]`,
    );
    if (!article) return;
    article.querySelectorAll(".section-collaboration-actions").forEach((node) => node.remove());

    for (const heading of article.querySelectorAll<HTMLElement>("h2[data-section-id]")) {
      const sectionId = heading.dataset.sectionId ?? "";
      const section = sectionMap.get(sectionId);
      if (!section) continue;
      const actions = document.createElement("div");
      actions.className = "section-collaboration-actions";

      const readButton = document.createElement("button");
      readButton.className = readSections[section.id] ? "is-read" : "";
      readButton.type = "button";
      readButton.textContent = readSections[section.id] ? "✓ 已阅" : "○ 标记已阅";
      readButton.addEventListener("click", () => {
        const read = !readSections[section.id];
        const next = { ...readSections, [section.id]: read };
        setReadSections(next);
        writeLocalProgress(documentKey, sections, next);
        fetch("/api/learning/sections", {
          body: JSON.stringify({
            documentKey,
            read,
            sectionId: section.id,
            sectionRevision: section.revision,
          }),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }).catch(() => undefined);
      });

      const discussionButton = document.createElement("button");
      discussionButton.type = "button";
      discussionButton.textContent = "评论";
      discussionButton.addEventListener("click", () => setActiveTarget({
        id: section.id,
        kind: "section",
        revision: section.revision,
        title: section.title,
      }));
      actions.append(readButton, discussionButton);
      heading.insertAdjacentElement("afterend", actions);
    }

    return () => {
      article.querySelectorAll(".section-collaboration-actions").forEach((node) => node.remove());
    };
  }, [articleKey, documentKey, readSections, sectionMap, sections]);

  return (
    <>
      <div className="article-discussion-entry">
        <button
          onClick={() => setActiveTarget({
            id: "article",
            kind: "article",
            revision: contentRevision,
            title: "全文",
          })}
          type="button"
        >
          <MessageSquare aria-hidden="true" size={16} />
          全文讨论
        </button>
      </div>
      {activeTarget ? (
        <DiscussionPanel
          documentKey={documentKey}
          onClose={() => setActiveTarget(undefined)}
          target={activeTarget}
        />
      ) : null}
    </>
  );
}
