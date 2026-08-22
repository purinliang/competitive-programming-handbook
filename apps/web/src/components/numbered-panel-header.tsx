import { PanelHeader } from "./panel-header";

function splitNumberedTitle(label: string): { number?: string; title: string } {
  const match = /^(\d+)\s+(.+)$/.exec(label);
  return match ? { number: match[1], title: match[2] } : { title: label };
}

export function NumberedPanelHeader({ label, detail }: { label: string; detail?: string }) {
  const { number, title } = splitNumberedTitle(label);

  return (
    <PanelHeader className="numbered-panel-header" detail={detail}>
      <div className="numbered-panel-title">
        {number ? <span className="numbered-panel-number">{number}</span> : null}
        <h2>{title}</h2>
      </div>
    </PanelHeader>
  );
}
