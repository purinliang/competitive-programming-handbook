import type { ReactNode } from "react";

export function Disclosure({
  bodyClassName,
  children,
  className,
  dataAreaKey,
  dataGroupKey,
  open,
  summary,
}: {
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
  dataAreaKey?: string;
  dataGroupKey?: string;
  open?: boolean;
  summary: ReactNode;
}) {
  return (
    <details
      className={`disclosure${className ? ` ${className}` : ""}`}
      data-area-key={dataAreaKey}
      data-group-key={dataGroupKey}
      open={open}
    >
      <summary>{summary}</summary>
      <div className={bodyClassName}>{children}</div>
    </details>
  );
}
