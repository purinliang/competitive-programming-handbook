"use client";

import { useSearchParams } from "next/navigation";

import { SiteHeader } from "./site-header";

export function ArticleSiteHeader() {
  const searchParams = useSearchParams();
  return <SiteHeader activeSection={searchParams.get("nav") === "learn" ? "learn" : "catalog"} />;
}
