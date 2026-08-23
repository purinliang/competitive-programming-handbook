import type { ArticleRecord, NavigationMode } from "@/lib/content/types";

import { ArticleProgress } from "./article-progress";
import { NavigationLink as Link } from "./navigation-link";

interface ArticleLinkProps {
  article: ArticleRecord;
  active?: boolean;
  entryKey?: string;
  label?: string;
  navigation?: NavigationMode;
}

export function ArticleLink({
  article,
  active = false,
  entryKey,
  label,
  navigation,
}: ArticleLinkProps) {
  const visibleTitle = label ?? (
    navigation === "learning-path" ? article.learningTitle : article.title
  );
  const title = `${article.kind === "extension" ? "*" : ""}${visibleTitle}`;
  const route = navigation === "learning-path" ? article.learningPathRoute : article.catalogRoute;
  const unavailable = !article.exists
    || ["计划", "推迟"].includes(article.status);
  if (unavailable) {
    return (
      <span
        className="article-link is-planned"
        data-article-key={article.articleKey}
        data-entry-key={entryKey}
        title="正文尚在计划中"
      >
        <span>{title}</span>
        <small>计划</small>
      </span>
    );
  }

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`article-link${active ? " is-active" : ""}`}
      data-article-key={article.articleKey}
      data-entry-key={entryKey}
      href={route}
      navigationEntry={entryKey && navigation ? {
        articleKey: article.articleKey,
        entryKey,
        mode: navigation,
      } : undefined}
    >
      <span>{title}</span>
      <ArticleProgress articleKey={article.articleKey} />
    </Link>
  );
}
