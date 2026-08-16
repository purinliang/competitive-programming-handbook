"use client";

import { useSearchParams } from "next/navigation";
import { useLayoutEffect } from "react";

import type { DirectoryReturnTarget } from "@/lib/content/types";

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

function findFallbackTarget(
  fallback: DirectoryReturnTarget | undefined,
): HTMLElement | undefined {
  if (!fallback) return undefined;
  if (fallback.kind === "section") {
    return document.getElementById(fallback.key) ?? undefined;
  }
  const attribute = fallback.kind === "area" ? "areaKey" : "groupKey";
  return findByDataAttribute(attribute, fallback.key);
}

export function DirectoryEntryRestorer({
  fallbacks = {},
}: {
  fallbacks?: Record<string, DirectoryReturnTarget>;
}) {
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    const entryKey = searchParams.get("entry");
    const groupKey = searchParams.get("group");
    const areaKey = searchParams.get("area");
    const sectionKey = searchParams.get("section");
    const articleKey = searchParams.get("article");
    const target = (entryKey ? findByDataAttribute("entryKey", entryKey) : undefined)
      ?? (articleKey
        ? findByDataAttribute("articleKey", articleKey)
          ?? findFallbackTarget(fallbacks[articleKey])
        : undefined)
      ?? (groupKey ? findByDataAttribute("groupKey", groupKey) : undefined)
      ?? (areaKey ? findByDataAttribute("areaKey", areaKey) : undefined)
      ?? (sectionKey ? document.getElementById(sectionKey) ?? undefined : undefined);
    if (!target) return;

    document.querySelectorAll(".is-return-target").forEach((element) => {
      element.classList.remove("is-return-target");
    });
    const visibleTarget = revealTarget(target);
    visibleTarget.classList.add("is-return-target");

    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    visibleTarget.scrollIntoView({ behavior: "auto", block: "center" });
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  }, [fallbacks, searchParams]);

  return null;
}
