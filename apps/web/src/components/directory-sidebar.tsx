"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { ScrollArea } from "./scroll-area";

import { useActiveSection } from "@/hooks/use-active-section";
import { scrollToElement } from "@/lib/scroll-to-element";

interface DirectorySidebarItem {
  id: string;
  label: string;
}

export function DirectorySidebar({ title, items }: { title: string; items: DirectorySidebarItem[] }) {
  const pathname = usePathname();
  const sectionIds = useMemo(() => items.map((item) => item.id), [items]);
  const activeId = useActiveSection(sectionIds);

  function navigateToSection(id: string) {
    const section = document.getElementById(id);
    if (!section) return;

    window.history.replaceState(null, "", `${pathname}#${id}`);
    document.querySelectorAll(".is-return-target").forEach((element) => {
      element.classList.remove("is-return-target");
    });
    scrollToElement(section);
  }

  return (
    <aside className="module-sidebar directory-sidebar" aria-label={title}>
      <div className="sidebar-heading sidebar-heading-single"><h2>{title}</h2></div>
      <ScrollArea className="sidebar-scroll-area" viewportClassName="sidebar-scroll-viewport" refreshKey={items.map((item) => item.id).join(":")}>
        <nav className="directory-sidebar-list">
          {items.map((item) => (
            <a
              aria-current={item.id === activeId ? "location" : undefined}
              className={item.id === activeId ? "is-active" : undefined}
              href={`${pathname}#${item.id}`}
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
                event.preventDefault();
                navigateToSection(item.id);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
