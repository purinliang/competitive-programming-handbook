import Link from "next/link";

import type { ArticleRecord } from "@/lib/content/types";

export function ArticleLink({ article, active = false, label }: { article: ArticleRecord; active?: boolean; label?: string }) {
  const visibleTitle = label ?? article.title;
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
    <Link className={`article-link${active ? " is-active" : ""}`} href={article.route} aria-current={active ? "page" : undefined}>
      <span>{visibleTitle}</span>
      <small>{article.status}</small>
    </Link>
  );
}
