"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import type { NavigationEntryContext } from "@/lib/navigation-entry";

type ClientNavigate = (
  href: string,
  entry?: NavigationEntryContext,
) => boolean;

const ClientNavigationContext = createContext<ClientNavigate | undefined>(
  undefined,
);

export function ClientNavigationProvider({
  children,
  navigate,
}: {
  children: ReactNode;
  navigate: ClientNavigate;
}) {
  return (
    <ClientNavigationContext value={navigate}>
      {children}
    </ClientNavigationContext>
  );
}

export function useClientNavigation() {
  return useContext(ClientNavigationContext);
}
