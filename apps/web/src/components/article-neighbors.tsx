import { ArticleNeighborsView } from "./article-neighbors-view";

import type { ArticleRecord } from "@/lib/content/types";

interface Neighbors {
  previous?: ArticleRecord;
  next?: ArticleRecord;
}

export function ArticleNeighbors({ catalog, learn }: { catalog: Neighbors; learn: Neighbors }) {
  return (
    <>
      <div className="article-navigation-variant is-catalog">
        <ArticleNeighborsView mode="catalog" {...catalog} />
      </div>
      <div className="article-navigation-variant is-learn">
        <ArticleNeighborsView mode="learn" {...learn} />
      </div>
    </>
  );
}
