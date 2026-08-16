"use client";

import { useMemo } from "react";

import { ScrollArea } from "./scroll-area";

import { useActiveSection } from "@/hooks/use-active-section";
import type { TableOfContentsItem } from "@/lib/content/types";
import { scrollToElement } from "@/lib/scroll-to-element";

export function ArticleTableOfContents({ articleKey, items }: { articleKey: string; items: TableOfContentsItem[] }) {
  const sectionIds = useMemo(() => items.map((item) => item.id), [items]);
  const activeId = useActiveSection(sectionIds, 184);

  return (
    <aside className="toc-sidebar" aria-label="本文目录">
      <div className="sidebar-heading sidebar-heading-single"><h2>本文目录</h2></div>
      <ScrollArea className="sidebar-scroll-area" viewportClassName="sidebar-scroll-viewport" refreshKey={articleKey}>
        <nav className="toc-list">
          {items.map((item, index) => {
            const className = [
              item.depth === 3 ? "toc-depth-3" : "",
              item.supplement ? "toc-supplement" : "",
              item.supplement && !items[index - 1]?.supplement
                ? "toc-supplement-start"
                : "",
              item.id === activeId ? "is-active" : "",
            ].filter(Boolean).join(" ");
            return (
              <a
                aria-current={item.id === activeId ? "location" : undefined}
                className={className}
                href={`#${item.id}`}
                key={item.id}
                onClick={(event) => {
                  if (
                    event.button !== 0
                    || event.metaKey
                    || event.ctrlKey
                    || event.shiftKey
                    || event.altKey
                  ) {
                    return;
                  }
                  const heading = document.getElementById(item.id);
                  if (!heading) return;
                  event.preventDefault();
                  window.history.pushState(null, "", `#${item.id}`);
                  scrollToElement(heading);
                }}
              >
                {item.title}
              </a>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
