"use client";

import { ArticleNavigationView } from "./article-navigation-view";
import { ArticleNeighborsView } from "./article-neighbors-view";

import { useNavigationEntry } from "@/hooks/use-navigation-entry";

import type { ArticleNavigation, NavigationMode } from "@/lib/content/types";

function selectNavigation(
  navigations: ArticleNavigation[],
  requestedEntryKey: string | null,
): ArticleNavigation {
  return navigations.find((navigation) => navigation.activeEntryKey === requestedEntryKey)
    ?? navigations[0];
}

export function ContextualArticleNavigation({
  articleKey,
  mode,
  navigations,
}: {
  articleKey: string;
  mode: NavigationMode;
  navigations: ArticleNavigation[];
}) {
  const requestedEntryKey = useNavigationEntry({
    articleKey,
    entryKeys: navigations.map((navigation) => navigation.activeEntryKey),
    mode,
  });
  const navigation = selectNavigation(navigations, requestedEntryKey);
  return <ArticleNavigationView mode={mode} navigation={navigation} />;
}

export function ContextualArticleNeighbors({
  articleKey,
  mode,
  navigations,
}: {
  articleKey: string;
  mode: NavigationMode;
  navigations: ArticleNavigation[];
}) {
  const requestedEntryKey = useNavigationEntry({
    articleKey,
    entryKeys: navigations.map((navigation) => navigation.activeEntryKey),
    mode,
  });
  const navigation = selectNavigation(navigations, requestedEntryKey);
  return (
    <ArticleNeighborsView
      mode={mode}
      previous={navigation.previous}
      next={navigation.next}
    />
  );
}
