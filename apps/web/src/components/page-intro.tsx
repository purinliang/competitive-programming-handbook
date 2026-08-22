import type { ReactNode } from "react";

export function PageIntro({
  description,
  eyebrow,
  title,
  className,
}: {
  description: ReactNode;
  eyebrow: ReactNode;
  title: ReactNode;
  className?: string;
}) {
  return (
    <header className={`page-intro${className ? ` ${className}` : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
