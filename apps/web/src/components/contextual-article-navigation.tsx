"use client";

import { useSearchParams } from "next/navigation";

import { ArticleNavigationView } from "./article-navigation-view";
import { ArticleNeighborsView } from "./article-neighbors-view";

import type { ArticleNavigation, NavigationMode } from "@/lib/content/types";

function selectNavigation(
  navigations: ArticleNavigation[],
  requestedEntryKey: string | null,
): ArticleNavigation {
  return navigations.find((navigation) => navigation.activeEntryKey === requestedEntryKey)
    ?? navigations[0];
}

export function ContextualArticleNavigation({
  mode,
  navigations,
}: {
  mode: NavigationMode;
  navigations: ArticleNavigation[];
}) {
  const searchParams = useSearchParams();
  const navigation = selectNavigation(navigations, searchParams.get("entry"));
  return <ArticleNavigationView mode={mode} navigation={navigation} />;
}

export function ContextualArticleNeighbors({
  mode,
  navigations,
}: {
  mode: NavigationMode;
  navigations: ArticleNavigation[];
}) {
  const searchParams = useSearchParams();
  const navigation = selectNavigation(navigations, searchParams.get("entry"));
  return (
    <ArticleNeighborsView
      mode={mode}
      previous={navigation.previous}
      next={navigation.next}
    />
  );
}
