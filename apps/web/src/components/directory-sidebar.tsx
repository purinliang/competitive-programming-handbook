"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ScrollArea } from "./scroll-area";

interface DirectorySidebarItem {
  id: string;
  label: string;
}

export function DirectorySidebar({ title, items }: { title: string; items: DirectorySidebarItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    let frame = 0;

    function updateActiveItem() {
      frame = 0;
      const threshold = 112;
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= threshold) {
          current = item.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    }

    function scheduleUpdate() {
      if (!frame) {
        frame = window.requestAnimationFrame(updateActiveItem);
      }
    }

    updateActiveItem();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
    };
  }, [items]);

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
