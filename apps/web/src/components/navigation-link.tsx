"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";

import { LoadingBar } from "./loading-bar";

import { stageNavigationEntry } from "@/lib/navigation-entry";

import type { NavigationEntryContext } from "@/lib/navigation-entry";

function NavigationPending() {
  const { pending } = useLinkStatus();
  return <LoadingBar active={pending} />;
}

type NavigationLinkProps = ComponentProps<typeof Link> & {
  navigationEntry?: NavigationEntryContext;
};

export function NavigationLink({
  children,
  navigationEntry,
  onClick,
  ...props
}: NavigationLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && navigationEntry) {
          stageNavigationEntry(navigationEntry);
        }
      }}
    >
      {children}
      <NavigationPending />
    </Link>
  );
}
