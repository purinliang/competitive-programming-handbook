import type { HTMLAttributes, ReactNode } from "react";

type PanelElement = "div" | "section";

export function Panel({
  as = "section",
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: PanelElement;
  children: ReactNode;
}) {
  const resolvedClassName = `panel${className ? ` ${className}` : ""}`;

  if (as === "div") {
    return (
      <div className={resolvedClassName} {...props}>
        {children}
      </div>
    );
  }

  return (
    <section className={resolvedClassName} {...props}>
      {children}
    </section>
  );
}
