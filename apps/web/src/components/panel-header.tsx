import type { ReactNode } from "react";

export function PanelHeader({
  children,
  className,
  detail,
}: {
  children: ReactNode;
  className?: string;
  detail?: ReactNode;
}) {
  const classes = ["panel-header", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classes}>
      {children}
      {detail ? <span>{detail}</span> : null}
    </header>
  );
}
