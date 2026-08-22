import { ArticleFamilyList } from "./article-family-list";
import { Disclosure } from "./disclosure";

import type { CatalogArea, NavigationMode } from "@/lib/content/types";

interface CatalogAreaListProps {
  activeEntryKey?: string;
  areas: CatalogArea[];
  navigation?: NavigationMode;
  sidebar?: boolean;
}

export function CatalogAreaList({
  activeEntryKey,
  areas,
  navigation,
  sidebar = false,
}: CatalogAreaListProps) {
  return (
    <div className={`catalog-area-list${sidebar ? " is-sidebar" : ""}`}>
      {areas.map((area) => {
        const active = area.groups.some((group) => (
          group.entryKeys.includes(activeEntryKey ?? "")
        ));
        return (
          <Disclosure
            bodyClassName="catalog-area-entries"
            className="catalog-area"
            dataAreaKey={area.key}
            open={active}
            key={area.key}
            summary={area.title}
          >
            <ArticleFamilyList
              groups={area.groups}
              activeEntryKey={activeEntryKey}
              navigation={navigation}
            />
          </Disclosure>
        );
      })}
    </div>
  );
}
