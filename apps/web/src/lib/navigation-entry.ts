import type { NavigationMode } from "./content/types";

export const NAVIGATION_ENTRY_EVENT = "handbook:navigation-entry-change";

const HISTORY_STATE_KEY = "handbookNavigationEntry";
const SESSION_PREFIX = "handbook:navigation-entry";
const stagedEntries = new Map<string, string>();

export interface NavigationEntryContext {
  articleKey: string;
  entryKey: string;
  mode: NavigationMode;
}

function contextKey(articleKey: string, mode: NavigationMode) {
  return `${mode}:${articleKey}`;
}

function sessionKey(articleKey: string, mode: NavigationMode) {
  return `${SESSION_PREFIX}:${contextKey(articleKey, mode)}`;
}

function validEntry(entryKey: string | null, allowedEntryKeys?: Set<string>) {
  return entryKey && (!allowedEntryKeys || allowedEntryKeys.has(entryKey))
    ? entryKey
    : null;
}

function currentHistoryState(): Record<string, unknown> {
  const state = window.history.state;
  return state && typeof state === "object" ? state : {};
}

function writeFallback(context: NavigationEntryContext) {
  const key = contextKey(context.articleKey, context.mode);
  stagedEntries.set(key, context.entryKey);
  try {
    window.sessionStorage.setItem(
      sessionKey(context.articleKey, context.mode),
      context.entryKey,
    );
  } catch {
    // 浏览器禁用存储时，当前页面的 history.state 仍然可以工作。
  }
}

export function stageNavigationEntry(context: NavigationEntryContext) {
  writeFallback(context);
  window.dispatchEvent(new CustomEvent(NAVIGATION_ENTRY_EVENT, {
    detail: context,
  }));
}

export function commitNavigationEntry(
  context: NavigationEntryContext,
  cleanLegacyQuery = false,
) {
  writeFallback(context);
  const state = {
    ...currentHistoryState(),
    [HISTORY_STATE_KEY]: context,
  };
  if (!cleanLegacyQuery) {
    window.history.replaceState(state, "");
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("entry");
  window.history.replaceState(
    state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

export function clearLegacyEntryQuery() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("entry")) return;
  url.searchParams.delete("entry");
  window.history.replaceState(
    currentHistoryState(),
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

export function readNavigationEntry(
  articleKey: string,
  mode: NavigationMode,
  allowedEntryKeys?: Set<string>,
): string | null {
  const historyContext = currentHistoryState()[HISTORY_STATE_KEY] as
    | NavigationEntryContext
    | undefined;
  if (
    historyContext?.articleKey === articleKey
    && historyContext.mode === mode
  ) {
    const historyEntry = validEntry(
      historyContext.entryKey,
      allowedEntryKeys,
    );
    if (historyEntry) return historyEntry;
  }

  const key = contextKey(articleKey, mode);
  const stagedEntry = validEntry(stagedEntries.get(key) ?? null, allowedEntryKeys);
  if (stagedEntry) return stagedEntry;

  try {
    return validEntry(
      window.sessionStorage.getItem(sessionKey(articleKey, mode)),
      allowedEntryKeys,
    );
  } catch {
    return null;
  }
}
