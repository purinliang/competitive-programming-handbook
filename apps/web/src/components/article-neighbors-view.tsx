import { ArrowLeft, ArrowRight } from "lucide-react";

import { NavigationLink as Link } from "./navigation-link";

import type {
  ArticleNavigationTarget,
  ArticleRecord,
  NavigationMode,
} from "@/lib/content/types";

export function ArticleNeighborsView({
  mode,
  previous,
  next,
}: {
  mode: NavigationMode;
  previous?: ArticleNavigationTarget;
  next?: ArticleNavigationTarget;
}) {
  const routeFor = ({ article }: ArticleNavigationTarget) => {
    return mode === "learning-path"
      ? article.learningPathRoute
      : article.catalogRoute;
  };
  const entryFor = ({ article, entryKey }: ArticleNavigationTarget) => {
    return { articleKey: article.articleKey, entryKey, mode };
  };
  const titleFor = (article: ArticleRecord) => {
    const title = mode === "learning-path"
      ? article.learningTitle
      : article.title;
    return `${article.kind === "extension" ? "*" : ""}${title}`;
  };
  return (
    <nav
      aria-label={mode === "learning-path"
        ? "学习路线中的相邻文章"
        : "模块中的相邻文章"}
      className="article-neighbors"
    >
      {previous ? (
        <Link
          href={routeFor(previous)}
          navigationEntry={entryFor(previous)}
        >
          <ArrowLeft aria-hidden="true" size={18} />
          <span>
            <small>上一篇</small>
            {titleFor(previous.article)}
          </span>
        </Link>
      ) : (
        <span aria-disabled="true" className="article-neighbor-disabled">
          <ArrowLeft aria-hidden="true" size={18} />
          <span><small>上一篇</small>没有更早的文章</span>
        </span>
      )}
      {next ? (
        <Link
          className="next"
          href={routeFor(next)}
          navigationEntry={entryFor(next)}
        >
          <span>
            <small>下一篇</small>
            {titleFor(next.article)}
          </span>
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="article-neighbor-disabled next"
        >
          <span><small>下一篇</small>已经到达末尾</span>
          <ArrowRight aria-hidden="true" size={18} />
        </span>
      )}
    </nav>
  );
}
