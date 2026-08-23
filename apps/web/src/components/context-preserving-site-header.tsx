"use client";

import { useSearchParams } from "next/navigation";

import { SiteHeader } from "./site-header";

type HeaderSection = "catalog" | "learning-path" | "search";

function contextualHref(
  path: string,
  articleKey: string | null,
): string {
  if (!articleKey) return path;

  const params = new URLSearchParams({ article: articleKey });
  return `${path}?${params.toString()}`;
}

export function ContextPreservingSiteHeader({
  activeSection,
}: {
  activeSection: HeaderSection;
}) {
  const searchParams = useSearchParams();
  const articleKey = searchParams.get("article");

  return (
    <SiteHeader
      activeSection={activeSection}
      catalogHref={contextualHref(
        "/catalog/",
        articleKey,
      )}
      learningPathHref={contextualHref(
        "/learning-path/",
        articleKey,
      )}
      searchHref={contextualHref(
        "/search/",
        articleKey,
      )}
    />
  );
}
