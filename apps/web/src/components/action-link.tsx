import type { ComponentProps, ReactNode } from "react";

import { NavigationLink } from "./navigation-link";

type NavigationLinkProps = ComponentProps<typeof NavigationLink>;

export function ActionLink({
  children,
  className,
  size = "default",
  tone = "primary",
  ...props
}: Omit<NavigationLinkProps, "children" | "className"> & {
  children: ReactNode;
  className?: string;
  size?: "default" | "large";
  tone?: "primary" | "secondary";
}) {
  const classes = [
    "action-link",
    `is-${tone}`,
    size === "large" ? "is-large" : "",
    className ?? "",
  ].filter(Boolean).join(" ");

  return (
    <NavigationLink className={classes} {...props}>
      {children}
    </NavigationLink>
  );
}
