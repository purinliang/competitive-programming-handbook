"use client";

import { SiteHeader } from "./site-header";

import type {
  DirectoryReturnTarget,
  NavigationMode,
} from "@/lib/content/types";

function directoryHref(
  basePath: string,
  articleKey: string,
  fallback?: DirectoryReturnTarget,
): string {
  const params = new URLSearchParams();
  params.set("article", articleKey);
  if (fallback) params.set(fallback.kind, fallback.key);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function ContextualSiteHeader({
  articleKey,
  catalogFallback,
  learningFallback,
  mode,
}: {
  articleKey: string;
  catalogFallback?: DirectoryReturnTarget;
  learningFallback?: DirectoryReturnTarget;
  mode: NavigationMode;
}) {
  return (
    <SiteHeader
      activeSection={mode}
      catalogHref={directoryHref(
        "/catalog/",
        articleKey,
        catalogFallback,
      )}
      learningPathHref={directoryHref(
        "/learning-path/",
        articleKey,
        learningFallback,
      )}
      searchHref={`/search/?article=${encodeURIComponent(articleKey)}`}
    />
  );
}
