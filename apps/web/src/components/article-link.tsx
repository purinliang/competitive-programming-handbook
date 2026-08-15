import { getArticleStatusLabel } from "@/lib/content/status";
import type { ArticleRecord, NavigationMode } from "@/lib/content/types";

import { NavigationLink as Link } from "./navigation-link";

export function ArticleLink({ article, active = false, label, navigation }: { article: ArticleRecord; active?: boolean; label?: string; navigation?: NavigationMode }) {
  const visibleTitle = label ?? article.title;
  const href = navigation === "learning-path" ? article.learningPathRoute : article.catalogRoute;
  const unavailable = !article.exists || article.status === "计划";
  if (unavailable) {
    return (
      <span className="article-link is-planned" title="正文尚在计划中">
        <span>{visibleTitle}</span>
        <small>计划</small>
      </span>
    );
  }

  return (
    <Link className={`article-link${active ? " is-active" : ""}`} href={href} aria-current={active ? "page" : undefined}>
      <span>{visibleTitle}</span>
      <small>{getArticleStatusLabel(article.status)}</small>
    </Link>
  );
}
