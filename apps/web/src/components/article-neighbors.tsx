"use client";

import { useSearchParams } from "next/navigation";

import { ArticleNeighborsView } from "./article-neighbors-view";

import type { ArticleRecord } from "@/lib/content/types";

interface Neighbors {
  previous?: ArticleRecord;
  next?: ArticleRecord;
}

export function ArticleNeighbors({ catalog, learn }: { catalog: Neighbors; learn: Neighbors }) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("nav") === "learn" ? "learn" : "catalog";
  const neighbors = mode === "learn" ? learn : catalog;
  return <ArticleNeighborsView mode={mode} {...neighbors} />;
}
