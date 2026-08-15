"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";

function NavigationPending() {
  const { pending } = useLinkStatus();
  return pending ? <span className="navigation-progress" role="progressbar" aria-label="正在载入页面"><span /></span> : null;
}

export function NavigationLink({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <NavigationPending />
    </Link>
  );
}
