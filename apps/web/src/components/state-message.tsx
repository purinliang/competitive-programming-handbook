import type { ReactNode } from "react";

export type StateMessageTone = "danger" | "neutral" | "success";

export function StateMessage({
  children,
  className,
  role,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  role?: "alert" | "status";
  tone?: StateMessageTone;
}) {
  const classes = [
    "state-message",
    `is-${tone}`,
    className ?? "",
  ].filter(Boolean).join(" ");

  return (
    <p className={classes} role={role}>
      {children}
    </p>
  );
}
