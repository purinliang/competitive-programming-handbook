"use client";

import { useSearchParams } from "next/navigation";

import { SiteHeader } from "./site-header";

import type {
  DirectoryReturnTarget,
  NavigationMode,
} from "@/lib/content/types";

function directoryHref(
  basePath: string,
  articleKey: string,
  entryKeys: string[],
  requestedEntryKey: string | null,
  fallback?: DirectoryReturnTarget,
): string {
  const entryKey = requestedEntryKey && entryKeys.includes(requestedEntryKey)
    ? requestedEntryKey
    : entryKeys[0];
  const params = new URLSearchParams();
  params.set("article", articleKey);
  if (entryKey) params.set("entry", entryKey);
  if (fallback) params.set(fallback.kind, fallback.key);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function ContextualSiteHeader({
  articleKey,
  catalogEntryKeys,
  catalogFallback,
  learningEntryKeys,
  learningFallback,
  mode,
}: {
  articleKey: string;
  catalogEntryKeys: string[];
  catalogFallback?: DirectoryReturnTarget;
  learningEntryKeys: string[];
  learningFallback?: DirectoryReturnTarget;
  mode: NavigationMode;
}) {
  const searchParams = useSearchParams();
  const requestedEntryKey = searchParams.get("entry");

  return (
    <SiteHeader
      activeSection={mode}
      catalogHref={directoryHref(
        "/catalog/",
        articleKey,
        catalogEntryKeys,
        requestedEntryKey,
        catalogFallback,
      )}
      learningPathHref={directoryHref(
        "/learning-path/",
        articleKey,
        learningEntryKeys,
        requestedEntryKey,
        learningFallback,
      )}
      searchHref={`/search/?article=${encodeURIComponent(articleKey)}`}
    />
  );
}
