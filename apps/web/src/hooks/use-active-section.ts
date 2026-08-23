"use client";

import { useLayoutEffect, useState } from "react";

export function useActiveSection(sectionIds: string[], threshold = 112) {
  const [activeId, setActiveId] = useState("");

  useLayoutEffect(() => {
    let frame = 0;

    function updateActiveSection() {
      frame = 0;
      let current = sectionIds[0] ?? "";
      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= threshold) {
          current = id;
        } else {
          break;
        }
      }
      setActiveId(current);
    }

    function scheduleUpdate() {
      if (!frame) {
        frame = window.requestAnimationFrame(updateActiveSection);
      }
    }

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    window.addEventListener("handbook:article-content-ready", scheduleUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
      window.removeEventListener(
        "handbook:article-content-ready",
        scheduleUpdate,
      );
    };
  }, [sectionIds, threshold]);

  return activeId;
}
