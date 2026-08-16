"use client";

import { useEffect } from "react";

const GUARD_DURATION_MS = 300;
const DISCLOSURE_SUMMARY_SELECTOR = [
  ".article-family > summary",
  ".catalog-area > summary",
].join(", ");

export function DisclosureSelectionGuard() {
  useEffect(() => {
    const timers = new Map<HTMLElement, number>();

    function handlePointerDown(event: PointerEvent) {
      if (event.button !== 0 || !(event.target instanceof Element)) return;
      const summary = event.target.closest<HTMLElement>(
        DISCLOSURE_SUMMARY_SELECTOR,
      );
      if (!summary) return;

      const previousTimer = timers.get(summary);
      if (previousTimer) window.clearTimeout(previousTimer);
      summary.classList.add("is-selection-guarded");
      const timer = window.setTimeout(() => {
        summary.classList.remove("is-selection-guarded");
        timers.delete(summary);
      }, GUARD_DURATION_MS);
      timers.set(summary, timer);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      for (const [summary, timer] of timers) {
        window.clearTimeout(timer);
        summary.classList.remove("is-selection-guarded");
      }
    };
  }, []);

  return null;
}
