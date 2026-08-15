import { ArticleFamilyList } from "./article-family-list";
import type { NavigationMode } from "./article-link";
import { ScrollArea } from "./scroll-area";

import type { ArticleNavigation } from "@/lib/content/types";

export function ArticleNavigationView({ articleKey, mode, navigation }: { articleKey: string; mode: NavigationMode; navigation: ArticleNavigation }) {
  return (
    <aside className="module-sidebar" aria-label={`${navigation.title}目录`}>
      <div className="sidebar-heading"><span>{navigation.label}</span><h2>{navigation.title}</h2></div>
      <ScrollArea className="sidebar-scroll-area" viewportClassName="sidebar-scroll-viewport" refreshKey={`${mode}:${articleKey}`}>
        <nav className="sidebar-list">
          <ArticleFamilyList groups={navigation.groups} activeArticleKey={articleKey} navigation={mode} />
        </nav>
      </ScrollArea>
    </aside>
  );
}
