import { ArticleNavigationView } from "./article-navigation-view";

import type { ArticleNavigation as ArticleNavigationData } from "@/lib/content/types";

interface ArticleNavigationProps {
  articleKey: string;
  moduleNavigation: ArticleNavigationData;
  learningNavigation?: ArticleNavigationData;
}

export function ArticleNavigation({ articleKey, moduleNavigation, learningNavigation }: ArticleNavigationProps) {
  if (!learningNavigation) {
    return <ArticleNavigationView articleKey={articleKey} mode="catalog" navigation={moduleNavigation} />;
  }

  return (
    <>
      <div className="article-navigation-variant is-catalog">
        <ArticleNavigationView articleKey={articleKey} mode="catalog" navigation={moduleNavigation} />
      </div>
      <div className="article-navigation-variant is-learn">
        <ArticleNavigationView articleKey={articleKey} mode="learn" navigation={learningNavigation} />
      </div>
    </>
  );
}
