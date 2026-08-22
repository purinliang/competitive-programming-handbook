import type { ReactNode } from "react";

import { DirectorySidebar } from "./directory-sidebar";
import { IndexingConvention } from "./indexing-convention";
import { PageIntro } from "./page-intro";

import type { DirectorySidebarItem } from "./directory-sidebar";

export function DirectoryPageShell({
  children,
  description,
  eyebrow,
  sidebarItems,
  title,
}: {
  children: ReactNode;
  description: ReactNode;
  eyebrow: ReactNode;
  sidebarItems: DirectorySidebarItem[];
  title: string;
}) {
  return (
    <main className="directory-layout">
      <DirectorySidebar title={title} items={sidebarItems} />
      <div className="index-page directory-content">
        <PageIntro
          description={description}
          eyebrow={eyebrow}
          title={title}
        />
        <IndexingConvention />
        <div className="section-stack">{children}</div>
      </div>
    </main>
  );
}
