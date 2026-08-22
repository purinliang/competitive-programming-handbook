import { ArticleFamilyList } from "./article-family-list";
import { CatalogAreaList } from "./catalog-area-list";
import { ScrollArea } from "./scroll-area";
import { SidebarHeader } from "./sidebar-header";

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
      <SidebarHeader label={navigation.label} title={navigation.title} />
      <ScrollArea
        className="sidebar-scroll-area"
        viewportClassName="sidebar-scroll-viewport"
        refreshKey={`${mode}:${navigation.activeEntryKey}`}
      >
        <nav className="sidebar-list">
          {navigation.areas ? (
            <CatalogAreaList
              areas={navigation.areas}
              activeEntryKey={navigation.activeEntryKey}
              navigation={mode}
              sidebar
            />
          ) : (
            <ArticleFamilyList
              groups={navigation.groups}
              activeEntryKey={navigation.activeEntryKey}
              navigation={mode}
            />
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
}
