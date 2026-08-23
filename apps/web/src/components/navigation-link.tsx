"use client";

import NextLink, { useLinkStatus } from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEvent,
} from "react";

import { useClientNavigation } from "./client-navigation";
import { LoadingBar } from "./loading-bar";

import { stageNavigationEntry } from "@/lib/navigation-entry";

import type { NavigationEntryContext } from "@/lib/navigation-entry";

type NavigationLinkProps = ComponentPropsWithoutRef<"a"> & {
  appRoute?: boolean;
  href: string;
  navigationEntry?: NavigationEntryContext;
  scroll?: boolean;
};

function NavigationPending() {
  const { pending } = useLinkStatus();
  return <LoadingBar active={pending} />;
}

export function NavigationLink({
  appRoute = false,
  children,
  href,
  navigationEntry,
  onClick,
  scroll,
  ...props
}: NavigationLinkProps) {
  const navigate = useClientNavigation();
  const timer = useRef<number | undefined>(undefined);
  const [pending, setPending] = useState(false);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (navigationEntry) {
      stageNavigationEntry(navigationEntry);
    }
    if (
      event.button === 0
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey
      && navigate?.(href, navigationEntry)
    ) {
      event.preventDefault();
      return;
    }
    if (!appRoute) {
      timer.current = window.setTimeout(() => setPending(true), 250);
    }
  }

  if (appRoute) {
    return (
      <NextLink
        {...props}
        href={href}
        onClick={handleClick}
        scroll={scroll}
      >
        {children}
        <NavigationPending />
      </NextLink>
    );
  }

  return (
    <a {...props} href={href} onClick={handleClick}>
      {children}
      <LoadingBar active={pending} />
    </a>
  );
}
