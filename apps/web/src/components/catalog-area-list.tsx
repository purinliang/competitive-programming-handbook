import { ArticleFamilyList } from "./article-family-list";

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
      {areas.map((area) => (
        <section className="catalog-area" key={area.key}>
          <h3>{area.title}</h3>
          <div className="catalog-area-entries">
            <ArticleFamilyList
              groups={area.groups}
              activeEntryKey={activeEntryKey}
              navigation={navigation}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
