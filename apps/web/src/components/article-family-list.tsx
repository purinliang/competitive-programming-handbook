import { Fragment } from "react";

import { ArticleLink } from "./article-link";
import { ArticleGroupProgress } from "./article-progress";
import { Disclosure } from "./disclosure";

import type { ArticleFamily, NavigationMode } from "@/lib/content/types";

interface ArticleFamilyListProps {
  groups: ArticleFamily[];
  activeEntryKey?: string;
  navigation?: NavigationMode;
}

export function ArticleFamilyList({ groups, activeEntryKey, navigation }: ArticleFamilyListProps) {
  return groups.map((group, index) => {
    const active = group.entryKeys.includes(activeEntryKey ?? "");
    if (!group.grouped) {
      return (
        <Fragment key={`${group.entryKeys[0]}:${index}`}>
          {group.articles.map((article, articleIndex) => (
            <ArticleLink
              article={article}
              active={group.entryKeys[articleIndex] === activeEntryKey}
              entryKey={group.entryKeys[articleIndex]}
              navigation={navigation}
              key={group.entryKeys[articleIndex]}
            />
          ))}
        </Fragment>
      );
    }

    return (
      <Disclosure
        className="article-family"
        dataGroupKey={group.entryKeys[0]}
        open={active}
        key={`${group.entryKeys[0]}:${index}`}
        summary={(
          <>
            <span>{group.title}{group.continued ? "（继续）" : ""}</span>
            <ArticleGroupProgress
              articleKeys={group.articles.map((article) => article.articleKey)}
            />
          </>
        )}
      >
        {group.articles.map((article, articleIndex) => (
          <ArticleLink
            article={article}
            active={group.entryKeys[articleIndex] === activeEntryKey}
            entryKey={group.entryKeys[articleIndex]}
            label={group.stripTitlePrefix
              ? article.title.slice(article.title.indexOf("：") + 1)
              : undefined}
            navigation={navigation}
            key={group.entryKeys[articleIndex]}
          />
        ))}
      </Disclosure>
    );
  });
}
