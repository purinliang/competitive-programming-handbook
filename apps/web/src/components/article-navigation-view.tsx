import { ArticleFamilyList } from "./article-family-list";
import { ScrollArea } from "./scroll-area";

import type { ArticleNavigation, NavigationMode } from "@/lib/content/types";

export function ArticleNavigationView({
  mode,
  navigation,
}: {
  mode: NavigationMode;
  navigation: ArticleNavigation;
}) {
  return (
    <aside className="module-sidebar" aria-label={`${navigation.title}目录`}>
      <div className="sidebar-heading"><span>{navigation.label}</span><h2>{navigation.title}</h2></div>
      <ScrollArea
        className="sidebar-scroll-area"
        viewportClassName="sidebar-scroll-viewport"
        refreshKey={`${mode}:${navigation.activeEntryKey}`}
      >
        <nav className="sidebar-list">
          <ArticleFamilyList
            groups={navigation.groups}
            activeEntryKey={navigation.activeEntryKey}
            navigation={mode}
          />
        </nav>
      </ScrollArea>
    </aside>
  );
}
