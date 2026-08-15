"use client";

import { useSearchParams } from "next/navigation";
import { useLayoutEffect } from "react";

export function ArticleNavigationModeSync() {
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    document.documentElement.dataset.articleNavigation = searchParams.get("nav") === "learn" ? "learn" : "catalog";
  }, [searchParams]);

  return null;
}
