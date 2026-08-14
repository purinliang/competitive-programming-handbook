"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface SearchRecord {
  articleKey: string;
  title: string;
  moduleTitle: string;
  route: string;
  status: string;
  text: string;
}

function rank(record: SearchRecord, terms: string[]): number {
  const title = record.title.toLocaleLowerCase("zh-CN");
  const moduleTitle = record.moduleTitle.toLocaleLowerCase("zh-CN");
  const text = record.text.toLocaleLowerCase("zh-CN");
  let score = 0;

  for (const term of terms) {
    if (!title.includes(term) && !moduleTitle.includes(term) && !text.includes(term)) {
      return -1;
    }
    if (title === term) score += 80;
    else if (title.includes(term)) score += 40;
    if (moduleTitle.includes(term)) score += 12;
    if (text.includes(term)) score += 4;
  }
  return score;
}

export function SearchExperience() {
  const [records, setRecords] = useState<SearchRecord[] | null>(null);
  const [query, setQuery] = useState("");
  const [settledQuery, setSettledQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const normalizedQuery = settledQuery.trim();
  const containsChinese = /[\u3400-\u9fff]/u.test(normalizedQuery);
  const asciiCharacterCount = normalizedQuery.match(/[a-z0-9]/giu)?.length ?? 0;
  const searchable = normalizedQuery.length > 0 && (containsChinese || asciiCharacterCount >= 3);

  useEffect(() => {
    if (composing) {
      return;
    }
    if (!query.trim()) {
      setSettledQuery("");
      return;
    }

    const timer = window.setTimeout(() => setSettledQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [composing, query]);

  useEffect(() => {
    if (!searchable || records) {
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
  }, [records, searchable]);

  const results = useMemo(() => {
    const terms = normalizedQuery.toLocaleLowerCase("zh-CN").split(/\s+/).filter(Boolean);
    if (!searchable || !records || terms.length === 0) {
      return [];
    }
    return records
      .map((record) => ({ record, score: rank(record, terms) }))
      .filter((item) => item.score >= 0)
      .sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title, "zh-CN"))
      .slice(0, 20)
      .map((item) => item.record);
  }, [normalizedQuery, records, searchable]);

  const summary = searchable
    ? records === null
      ? "正在载入搜索索引"
      : `${results.length} 个结果`
    : "";
  const hasResults = searchable && records !== null && results.length > 0;

  return (
    <div>
      <label className="search-box">
        <Search aria-hidden="true" size={19} />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={(event) => {
            setComposing(false);
            setSettledQuery(event.currentTarget.value);
          }}
          placeholder="搜索标题、概念或代码名称"
        />
      </label>
      <div className="search-summary">{summary}</div>
      <div className={`panel search-results${hasResults ? "" : " is-empty"}`}>
        {!searchable ? <p className="search-empty">请输入至少 1 个中文字符，或 3 个英文/数字字符。</p> : null}
        {searchable && records === null ? <p className="search-empty">正在载入搜索索引。</p> : null}
        {searchable && records ? results.map((record) => (
          <Link className="search-result" href={record.route} key={record.articleKey}>
            <div><strong>{record.title}</strong><p>{record.moduleTitle} · {record.status}</p></div>
            <span>{record.articleKey}</span>
          </Link>
        )) : null}
        {searchable && records && results.length === 0 ? <p className="search-empty">没有找到同时包含这些关键词的文章。</p> : null}
      </div>
    </div>
  );
}
