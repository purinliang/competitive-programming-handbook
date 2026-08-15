import { ArrowLeft, ArrowRight } from "lucide-react";

import { NavigationLink as Link } from "./navigation-link";

import type { ArticleRecord, NavigationMode } from "@/lib/content/types";

export function ArticleNeighborsView({ mode, previous, next }: { mode: NavigationMode; previous?: ArticleRecord; next?: ArticleRecord }) {
  const routeFor = (article: ArticleRecord) => mode === "learning-path" ? article.learningPathRoute : article.catalogRoute;
  return (
    <nav className="article-neighbors" aria-label={mode === "learning-path" ? "学习路线中的相邻文章" : "模块中的相邻文章"}>
      {previous ? <Link href={routeFor(previous)}><ArrowLeft aria-hidden="true" /><span><small>上一篇</small>{previous.title}</span></Link> : <span className="article-neighbor-disabled" aria-disabled="true"><ArrowLeft aria-hidden="true" /><span><small>上一篇</small>没有更早的文章</span></span>}
      {next ? <Link className="next" href={routeFor(next)}><span><small>下一篇</small>{next.title}</span><ArrowRight aria-hidden="true" /></Link> : <span className="article-neighbor-disabled next" aria-disabled="true"><span><small>下一篇</small>已经到达末尾</span><ArrowRight aria-hidden="true" /></span>}
    </nav>
  );
}
