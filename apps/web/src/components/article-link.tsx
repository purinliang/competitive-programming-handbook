import { getArticleStatusLabel } from "@/lib/content/status";
import type { ArticleRecord, NavigationMode } from "@/lib/content/types";

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
  const visibleTitle = label ?? (navigation === "learning-path" ? article.learningTitle : article.title);
  const title = `${visibleTitle}${article.kind === "extension" ? "*" : ""}`;
  const route = navigation === "learning-path" ? article.learningPathRoute : article.catalogRoute;
  const href = entryKey ? `${route}?entry=${encodeURIComponent(entryKey)}` : route;
  const unavailable = !article.exists || article.status === "计划";
  if (unavailable) {
    return (
      <span className="article-link is-planned" title="正文尚在计划中">
        <span>{title}</span>
        <small>计划</small>
      </span>
    );
  }

  return (
    <Link className={`article-link${active ? " is-active" : ""}`} href={href} aria-current={active ? "page" : undefined}>
      <span>{title}</span>
      <small>{getArticleStatusLabel(article.status)}</small>
    </Link>
  );
}
