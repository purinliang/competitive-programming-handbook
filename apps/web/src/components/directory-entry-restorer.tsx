"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect } from "react";

import { scrollToElement } from "@/lib/scroll-to-element";

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
    return scrollToElement(visibleTarget, { block: "center" });
  }, [pathname, searchParams]);

  return null;
}
