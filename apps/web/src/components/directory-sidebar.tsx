"use client";

import { useMemo } from "react";

import { NavigationLink as Link } from "./navigation-link";
import { ScrollArea } from "./scroll-area";

import { useActiveSection } from "@/hooks/use-active-section";

interface DirectorySidebarItem {
  id: string;
  label: string;
}

export function DirectorySidebar({ title, items }: { title: string; items: DirectorySidebarItem[] }) {
  const sectionIds = useMemo(() => items.map((item) => item.id), [items]);
  const activeId = useActiveSection(sectionIds);

  return (
    <aside className="module-sidebar directory-sidebar" aria-label={title}>
      <div className="sidebar-heading sidebar-heading-single"><h2>{title}</h2></div>
      <ScrollArea className="sidebar-scroll-area" viewportClassName="sidebar-scroll-viewport" refreshKey={items.map((item) => item.id).join(":")}>
        <nav className="directory-sidebar-list">
          {items.map((item) => (
            <Link className={item.id === activeId ? "is-active" : undefined} href={`#${item.id}`} aria-current={item.id === activeId ? "location" : undefined} key={item.id}>
              {item.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
