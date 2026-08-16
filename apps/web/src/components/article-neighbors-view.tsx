import { ArrowLeft, ArrowRight } from "lucide-react";

import { NavigationLink as Link } from "./navigation-link";

import type { ArticleNavigationTarget, ArticleRecord, NavigationMode } from "@/lib/content/types";

export function ArticleNeighborsView({
  mode,
  previous,
  next,
}: {
  mode: NavigationMode;
  previous?: ArticleNavigationTarget;
  next?: ArticleNavigationTarget;
}) {
  const routeFor = ({ article, entryKey }: ArticleNavigationTarget) => {
    const route = mode === "learning-path" ? article.learningPathRoute : article.catalogRoute;
    return `${route}?entry=${encodeURIComponent(entryKey)}`;
  };
  const titleFor = (article: ArticleRecord) => mode === "learning-path" ? article.learningTitle : article.title;
  return (
    <nav className="article-neighbors" aria-label={mode === "learning-path" ? "学习路线中的相邻文章" : "模块中的相邻文章"}>
      {previous ? <Link href={routeFor(previous)}><ArrowLeft aria-hidden="true" size={18} /><span><small>上一篇</small>{titleFor(previous.article)}</span></Link> : <span className="article-neighbor-disabled" aria-disabled="true"><ArrowLeft aria-hidden="true" size={18} /><span><small>上一篇</small>没有更早的文章</span></span>}
      {next ? <Link className="next" href={routeFor(next)}><span><small>下一篇</small>{titleFor(next.article)}</span><ArrowRight aria-hidden="true" size={18} /></Link> : <span className="article-neighbor-disabled next" aria-disabled="true"><span><small>下一篇</small>已经到达末尾</span><ArrowRight aria-hidden="true" size={18} /></span>}
    </nav>
  );
}
