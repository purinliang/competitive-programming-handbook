import type { ReactNode } from "react";

import { NumberedPanelHeader } from "./numbered-panel-header";
import { Panel } from "./panel";

export function DirectorySection({
  children,
  detail,
  id,
  label,
}: {
  children: ReactNode;
  detail?: string;
  id: string;
  label: string;
}) {
  return (
    <Panel id={id}>
      <NumberedPanelHeader label={label} detail={detail} />
      <div className="article-list">{children}</div>
    </Panel>
  );
}
