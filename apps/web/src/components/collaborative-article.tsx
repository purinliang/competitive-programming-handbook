"use client";

import { MessageSquare } from "lucide-react";
import {
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { DiscussionPanel } from "./discussion-panel";

import type { DiscussionTarget } from "./discussion-panel";
import type { ArticleSection } from "@/lib/content/types";

interface SectionActionSlot {
  element: HTMLElement;
  section: ArticleSection;
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
  const [sectionActionSlots, setSectionActionSlots] = useState<SectionActionSlot[]>([]);
  const sectionMap = useMemo(
    () => new Map(sections.map((section) => [section.id, section])),
    [sections],
  );

  useLayoutEffect(() => {
    const article = document.querySelector<HTMLElement>(
      `.markdown-body[data-article-key="${articleKey}"]`,
    );
    if (!article) return;
    const slots = [...article.querySelectorAll<HTMLElement>(
      "[data-section-action-slot]",
    )].flatMap((element) => {
      const section = sectionMap.get(element.dataset.sectionActionSlot ?? "");
      return section ? [{ element, section }] : [];
    });
    setSectionActionSlots(slots);
  }, [articleKey, sectionMap]);

  return (
    <>
      {sectionActionSlots.map(({ element, section }) => createPortal(
        <div className="section-collaboration-actions">
          <button
            aria-label={`评论：${section.title}`}
            onClick={() => setActiveTarget({
              id: section.id,
              kind: "section",
              revision: section.revision,
              title: section.title,
            })}
            title="评论"
            type="button"
          >
            <MessageSquare aria-hidden="true" size={16} />
          </button>
        </div>,
        element,
        section.id,
      ))}
      <section className="article-discussion-summary">
        <DiscussionPanel
          documentKey={documentKey}
          inline
          target={{
            id: "article",
            kind: "article",
            revision: contentRevision,
            title: "整篇文章",
          }}
        />
      </section>
      {activeTarget ? (
        <DiscussionPanel
          documentKey={documentKey}
          key={activeTarget.id}
          onClose={() => setActiveTarget(undefined)}
          target={activeTarget}
        />
      ) : null}
    </>
  );
}
