import type { HTMLAttributes, ReactNode } from "react";

type PanelElement = "article" | "aside" | "div" | "section";

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

  if (as === "article") {
    return (
      <article className={resolvedClassName} {...props}>
        {children}
      </article>
    );
  }

  if (as === "aside") {
    return (
      <aside className={resolvedClassName} {...props}>
        {children}
      </aside>
    );
  }

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
