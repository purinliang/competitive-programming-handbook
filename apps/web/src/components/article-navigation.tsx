"use client";

import { useSearchParams } from "next/navigation";

import type { NavigationMode } from "./article-link";
import { ArticleNavigationView } from "./article-navigation-view";

import type { ArticleNavigation as ArticleNavigationData } from "@/lib/content/types";

interface ArticleNavigationProps {
  articleKey: string;
  moduleNavigation: ArticleNavigationData;
  learningNavigation?: ArticleNavigationData;
}

export function ArticleNavigation({ articleKey, moduleNavigation, learningNavigation }: ArticleNavigationProps) {
  const searchParams = useSearchParams();
  const requestedMode: NavigationMode = searchParams.get("nav") === "learn" ? "learn" : "catalog";
  const mode: NavigationMode = requestedMode === "learn" && learningNavigation ? "learn" : "catalog";
  const navigation = mode === "learn" && learningNavigation ? learningNavigation : moduleNavigation;

  return <ArticleNavigationView articleKey={articleKey} mode={mode} navigation={navigation} />;
}
