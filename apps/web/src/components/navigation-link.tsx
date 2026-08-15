"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";

import { LoadingBar } from "./loading-bar";

function NavigationPending() {
  const { pending } = useLinkStatus();
  return <LoadingBar active={pending} />;
}

export function NavigationLink({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <NavigationPending />
    </Link>
  );
}
