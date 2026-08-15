import { ArticleLink } from "./article-link";

import type { ArticleFamily, NavigationMode } from "@/lib/content/types";

interface ArticleFamilyListProps {
  groups: ArticleFamily[];
  activeArticleKey?: string;
  navigation?: NavigationMode;
}

export function ArticleFamilyList({ groups, activeArticleKey, navigation }: ArticleFamilyListProps) {
  return groups.map((group, index) => {
    const active = group.articles.some((article) => article.articleKey === activeArticleKey);
    if (!group.grouped) {
      const article = group.articles[0];
      return <ArticleLink article={article} active={active} navigation={navigation} key={article.articleKey} />;
    }

    return (
      <details className="article-family" open={active} key={`${group.articles[0].articleKey}:${index}`}>
        <summary>
          <span>{group.title}{group.continued ? "（继续）" : ""}</span>
          <small>{group.articles.length}</small>
        </summary>
        <div>
          {group.articles.map((article) => (
            <ArticleLink
              article={article}
              active={article.articleKey === activeArticleKey}
              label={article.title.slice(article.title.indexOf("：") + 1)}
              navigation={navigation}
              key={article.articleKey}
            />
          ))}
        </div>
      </details>
    );
  });
}
