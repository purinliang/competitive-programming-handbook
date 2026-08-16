"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect } from "react";

const RESTORE_SCROLL_DURATION_MS = 300;

function findByDataAttribute(
  attribute: "areaKey" | "articleKey" | "entryKey" | "groupKey",
  key: string,
): HTMLElement | undefined {
  const dataAttribute = attribute.replace(/[A-Z]/g, (letter) => (
    `-${letter.toLowerCase()}`
  ));
  return [...document.querySelectorAll<HTMLElement>(`[data-${dataAttribute}]`)]
    .find((element) => element.dataset[attribute] === key);
}

function revealTarget(target: HTMLElement): HTMLElement {
  if (target instanceof HTMLDetailsElement) target.open = true;

  let ancestor = target.parentElement;
  while (ancestor) {
    if (ancestor instanceof HTMLDetailsElement) ancestor.open = true;
    ancestor = ancestor.parentElement;
  }

  if (target.matches("details")) {
    const summary = target.querySelector<HTMLElement>(":scope > summary");
    return summary ?? target;
  }
  return target;
}

function findClosestModuleTarget(articleKey: string): HTMLElement | undefined {
  const moduleKey = articleKey.split("/")[0];
  const article = [...document.querySelectorAll<HTMLElement>("[data-article-key]")]
    .find((element) => element.dataset.articleKey?.startsWith(`${moduleKey}/`));
  return article?.closest<HTMLElement>("[data-group-key], section") ?? undefined;
}

function scrollToTarget(target: HTMLElement): () => void {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  const start = window.scrollY;
  const rectangle = target.getBoundingClientRect();
  const maximum = Math.max(0, root.scrollHeight - window.innerHeight);
  const destination = Math.min(
    maximum,
    Math.max(0, start + rectangle.top - (window.innerHeight - rectangle.height) / 2),
  );
  const distance = destination - start;
  root.style.scrollBehavior = "auto";

  if (
    Math.abs(distance) < 2
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    window.scrollTo(0, destination);
    root.style.scrollBehavior = previousScrollBehavior;
    return () => {};
  }

  let frame = 0;
  const startedAt = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / RESTORE_SCROLL_DURATION_MS);
    const eased = progress < 0.5
      ? 4 * progress ** 3
      : 1 - (-2 * progress + 2) ** 3 / 2;
    window.scrollTo(0, start + distance * eased);
    if (progress < 1) {
      frame = requestAnimationFrame(step);
    } else {
      root.style.scrollBehavior = previousScrollBehavior;
    }
  };
  frame = requestAnimationFrame(step);

  return () => {
    cancelAnimationFrame(frame);
    root.style.scrollBehavior = previousScrollBehavior;
  };
}

export function DirectoryEntryRestorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    if (!/^\/(?:learning-path|catalog)\/?$/u.test(pathname)) return;

    const entryKey = searchParams.get("entry");
    const groupKey = searchParams.get("group");
    const areaKey = searchParams.get("area");
    const sectionKey = searchParams.get("section");
    const articleKey = searchParams.get("article");
    const target = (entryKey ? findByDataAttribute("entryKey", entryKey) : undefined)
      ?? (articleKey
        ? findByDataAttribute("articleKey", articleKey)
          ?? findClosestModuleTarget(articleKey)
        : undefined)
      ?? (groupKey ? findByDataAttribute("groupKey", groupKey) : undefined)
      ?? (areaKey ? findByDataAttribute("areaKey", areaKey) : undefined)
      ?? (sectionKey ? document.getElementById(sectionKey) ?? undefined : undefined);

    document.querySelectorAll(".is-return-target").forEach((element) => {
      element.classList.remove("is-return-target");
    });
    if (!target) return;
    const visibleTarget = revealTarget(target);
    visibleTarget.classList.add("is-return-target");
    return scrollToTarget(visibleTarget);
  }, [pathname, searchParams]);

  return null;
}
