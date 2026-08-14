"use client";

import { useSearchParams } from "next/navigation";

import { SiteHeader } from "./site-header";

interface NavigationItem {
  href: string;
  label: string;
  active?: boolean;
}

export function ArticleSiteHeader({ catalogNavigation, learningNavigation }: { catalogNavigation: NavigationItem[]; learningNavigation?: NavigationItem[] }) {
  const searchParams = useSearchParams();
  const learningMode = searchParams.get("nav") === "learn" && learningNavigation;

  return learningMode
    ? <SiteHeader activeSection="learn" secondaryNavigation={learningNavigation} />
    : <SiteHeader activeSection="catalog" secondaryNavigation={catalogNavigation} />;
}
