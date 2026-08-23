"use client";

import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearLegacyEntryQuery,
  commitNavigationEntry,
  NAVIGATION_ENTRY_EVENT,
  readNavigationEntry,
} from "@/lib/navigation-entry";

import type { NavigationMode } from "@/lib/content/types";
import type { NavigationEntryContext } from "@/lib/navigation-entry";

export function useNavigationEntry({
  articleKey,
  entryKeys,
  mode,
}: {
  articleKey: string;
  entryKeys: string[];
  mode: NavigationMode;
}) {
  const searchParams = useSearchParams();
  const legacyEntry = searchParams.get("entry");
  const entryKeySignature = entryKeys.join("\u0000");
  const allowedEntryKeys = useMemo(
    () => new Set(entryKeys),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entryKeySignature],
  );
  const [entryKey, setEntryKey] = useState<string | null>(() => {
    if (legacyEntry && allowedEntryKeys.has(legacyEntry)) return legacyEntry;
    if (typeof window === "undefined") return null;
    return readNavigationEntry(articleKey, mode, allowedEntryKeys);
  });

  useEffect(() => {
    const resolved = legacyEntry && allowedEntryKeys.has(legacyEntry)
      ? legacyEntry
      : readNavigationEntry(articleKey, mode, allowedEntryKeys);
    setEntryKey((current) => current === resolved ? current : resolved);
    if (resolved) {
      commitNavigationEntry(
        { articleKey, entryKey: resolved, mode },
        Boolean(legacyEntry),
      );
    } else if (legacyEntry) {
      clearLegacyEntryQuery();
    }
  }, [allowedEntryKeys, articleKey, legacyEntry, mode]);

  useEffect(() => {
    function handleEntryChange(event: Event) {
      const context = (event as CustomEvent<NavigationEntryContext>).detail;
      if (
        context.articleKey !== articleKey
        || context.mode !== mode
        || !allowedEntryKeys.has(context.entryKey)
      ) {
        return;
      }
      setEntryKey(context.entryKey);
      commitNavigationEntry(context);
    }

    window.addEventListener(NAVIGATION_ENTRY_EVENT, handleEntryChange);
    return () => window.removeEventListener(
      NAVIGATION_ENTRY_EVENT,
      handleEntryChange,
    );
  }, [allowedEntryKeys, articleKey, mode]);

  return entryKey;
}
