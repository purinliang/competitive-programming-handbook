"use client";

import { MessageSquare } from "lucide-react";
import {
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { IconButton } from "./button";
import { DiscussionPanel } from "./discussion-panel";
import { Panel } from "./panel";

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
    function collectSectionSlots() {
      const article = document.querySelector<HTMLElement>(
        `.markdown-body[data-article-key="${articleKey}"]`,
      );
      if (!article) return;
      const slots = [...article.querySelectorAll<HTMLElement>(
        "[data-section-action-slot]",
      )].flatMap((element) => {
        const section = sectionMap.get(
          element.dataset.sectionActionSlot ?? "",
        );
        return section ? [{ element, section }] : [];
      });
      setSectionActionSlots(slots);
    }

    function handleContentReady(event: Event) {
      const readyEvent = event as CustomEvent<{ articleKey?: string }>;
      if (readyEvent.detail?.articleKey === articleKey) {
        collectSectionSlots();
      }
    }

    collectSectionSlots();
    window.addEventListener(
      "handbook:article-content-ready",
      handleContentReady,
    );
    return () => window.removeEventListener(
      "handbook:article-content-ready",
      handleContentReady,
    );
  }, [articleKey, sectionMap]);

  return (
    <>
      {sectionActionSlots.map(({ element, section }) => createPortal(
        <div className="section-collaboration-actions">
          <IconButton
            aria-label={`评论：${section.title}`}
            compact
            onClick={() => setActiveTarget({
              id: section.id,
              kind: "section",
              revision: section.revision,
              title: section.title,
            })}
            title="评论"
          >
            <MessageSquare aria-hidden="true" size={16} />
          </IconButton>
        </div>,
        element,
        section.id,
      ))}
      <Panel className="article-discussion-summary">
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
      </Panel>
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
