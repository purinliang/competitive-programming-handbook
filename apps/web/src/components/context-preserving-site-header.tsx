"use client";

import { useSearchParams } from "next/navigation";

import { SiteHeader } from "./site-header";

type HeaderSection = "catalog" | "learning-path" | "search";

function contextualHref(
  path: string,
  section: HeaderSection,
  activeSection: HeaderSection,
  articleKey: string | null,
  entryKey: string | null,
): string {
  if (!articleKey) return path;

  const params = new URLSearchParams({ article: articleKey });
  if (section === activeSection && entryKey) params.set("entry", entryKey);
  return `${path}?${params.toString()}`;
}

export function ContextPreservingSiteHeader({
  activeSection,
}: {
  activeSection: HeaderSection;
}) {
  const searchParams = useSearchParams();
  const articleKey = searchParams.get("article");
  const entryKey = searchParams.get("entry");

  return (
    <SiteHeader
      activeSection={activeSection}
      catalogHref={contextualHref(
        "/catalog/",
        "catalog",
        activeSection,
        articleKey,
        entryKey,
      )}
      learningPathHref={contextualHref(
        "/learning-path/",
        "learning-path",
        activeSection,
        articleKey,
        entryKey,
      )}
      searchHref={contextualHref(
        "/search/",
        "search",
        activeSection,
        articleKey,
        entryKey,
      )}
    />
  );
}
