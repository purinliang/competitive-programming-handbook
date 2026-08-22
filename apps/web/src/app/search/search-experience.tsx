"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { NavigationLink as Link } from "@/components/navigation-link";
import { Panel } from "@/components/panel";
import { StateMessage } from "@/components/state-message";
import { getArticleStatusLabel } from "@/lib/content/status";
import {
  getSearchDelay,
  isSearchableQuery,
  rankSearchRecords,
} from "@/lib/search-ranking";

import type { SearchRecord } from "@/lib/search-ranking";

export function SearchExperience() {
  const [records, setRecords] = useState<SearchRecord[] | null>(null);
  const [query, setQuery] = useState("");
  const [settledQuery, setSettledQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const currentQuery = query.trim();
  const normalizedQuery = settledQuery.trim();
  const searchable = isSearchableQuery(normalizedQuery);
  const queryPending = currentQuery !== normalizedQuery;

  useEffect(() => {
    if (composing) {
      return;
    }
    if (!currentQuery) {
      setSettledQuery("");
      return;
    }

    const delay = getSearchDelay(currentQuery);
    if (delay === 0) {
      setSettledQuery(query);
      return;
    }

    const timer = window.setTimeout(() => setSettledQuery(query), delay);
    return () => window.clearTimeout(timer);
  }, [composing, currentQuery, query]);

  useEffect(() => {
    if (!currentQuery || records) {
      return;
    }

    let cancelled = false;
    void fetch("/search-index.json")
      .then((response) => response.json())
      .then((result: SearchRecord[]) => {
        if (!cancelled) setRecords(result);
      });
    return () => {
      cancelled = true;
    };
  }, [currentQuery, records]);

  const matches = useMemo(() => {
    if (!searchable || !records) {
      return { records: [], total: 0 };
    }
    return rankSearchRecords(records, normalizedQuery, 10);
  }, [normalizedQuery, records, searchable]);

  const results = searchable ? matches.records : [];

  const summary = queryPending
    ? "正在搜索"
    : searchable
    ? records === null
      ? "正在载入搜索索引"
      : matches.total > 10
        ? "超过 10 个结果"
        : `${matches.total} 个结果`
    : "";
  const hasResults = records !== null && results.length > 0;

  return (
    <div>
      <label className="search-box">
        <Search aria-hidden="true" size={19} />
        <input
          autoFocus
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            if (!value.trim()) setSettledQuery("");
          }}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={(event) => {
            setComposing(false);
            setQuery(event.currentTarget.value);
          }}
          placeholder="搜索标题、概念或代码名称"
        />
      </label>
      <div className="search-summary" aria-live="polite">{summary}</div>
      <Panel
        as="div"
        aria-busy={queryPending}
        className={`search-results${hasResults ? "" : " is-empty"}`}
      >
        {queryPending && !hasResults ? (
          <StateMessage className="search-empty" role="status">
            正在搜索。
          </StateMessage>
        ) : null}
        {!queryPending && !currentQuery ? (
          <StateMessage className="search-empty">
            请输入知识点、算法缩写或代码标识符。
          </StateMessage>
        ) : null}
        {!queryPending && searchable && records === null ? (
          <StateMessage className="search-empty" role="status">
            正在载入搜索索引。
          </StateMessage>
        ) : null}
        {records ? results.map((record) => (
          <Link
            className="search-result"
            data-article-key={record.articleKey}
            href={record.route}
            key={record.articleKey}
          >
            <div>
              <strong>{record.title}</strong>
              <p>
                {record.moduleTitle} · {getArticleStatusLabel(record.status)}
              </p>
            </div>
            <span>{record.articleKey}</span>
          </Link>
        )) : null}
        {!queryPending && searchable && records && results.length === 0 ? (
          <StateMessage className="search-empty">
            没有找到同时包含这些关键词的文章。
          </StateMessage>
        ) : null}
      </Panel>
    </div>
  );
}
