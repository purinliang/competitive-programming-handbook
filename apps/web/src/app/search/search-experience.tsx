"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { NavigationLink as Link } from "@/components/navigation-link";
import { getArticleStatusLabel } from "@/lib/content/status";

interface SearchRecord {
  articleKey: string;
  title: string;
  moduleTitle: string;
  route: string;
  status: string;
  text: string;
}

interface RankedSearchRecord {
  record: SearchRecord;
  sourceIndex: number;
  exactTitle: boolean;
  titleMatches: number;
  titleOccurrences: number;
  moduleMatches: number;
  textOccurrences: number;
}

function countOccurrences(text: string, term: string): number {
  let count = 0;
  let start = 0;

  while (true) {
    const position = text.indexOf(term, start);
    if (position === -1) {
      return count;
    }
    count++;
    start = position + term.length;
  }
}

function rank(record: SearchRecord, terms: string[], sourceIndex: number): RankedSearchRecord | null {
  const title = record.title.toLocaleLowerCase("zh-CN");
  const moduleTitle = record.moduleTitle.toLocaleLowerCase("zh-CN");
  const text = record.text.toLocaleLowerCase("zh-CN");
  let titleMatches = 0;
  let titleOccurrences = 0;
  let moduleMatches = 0;
  let textOccurrences = 0;

  for (const term of terms) {
    const titleCount = countOccurrences(title, term);
    const moduleCount = countOccurrences(moduleTitle, term);
    const textCount = countOccurrences(text, term);
    if (titleCount === 0 && moduleCount === 0 && textCount === 0) {
      return null;
    }
    if (titleCount > 0) titleMatches++;
    if (moduleCount > 0) moduleMatches++;
    titleOccurrences += titleCount;
    textOccurrences += textCount;
  }

  return {
    record,
    sourceIndex,
    exactTitle: title === terms.join(" "),
    titleMatches,
    titleOccurrences,
    moduleMatches,
    textOccurrences,
  };
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

  const matches = useMemo(() => {
    const terms = normalizedQuery.toLocaleLowerCase("zh-CN").split(/\s+/).filter(Boolean);
    if (!searchable || !records || terms.length === 0) {
      return { records: [], total: 0 };
    }
    const ranked = records
      .map((record, sourceIndex) => rank(record, terms, sourceIndex))
      .filter((item): item is RankedSearchRecord => item !== null)
      .sort((a, b) =>
        Number(b.exactTitle) - Number(a.exactTitle)
        || b.titleMatches - a.titleMatches
        || b.titleOccurrences - a.titleOccurrences
        || b.moduleMatches - a.moduleMatches
        || b.textOccurrences - a.textOccurrences
        || a.sourceIndex - b.sourceIndex
      );

    return {
      records: ranked.slice(0, 20).map((item) => item.record),
      total: ranked.length,
    };
  }, [normalizedQuery, records, searchable]);

  const results = matches.records;

  const summary = searchable
    ? records === null
      ? "正在载入搜索索引"
      : matches.total > 20
        ? "超过 20 个结果"
        : `${matches.total} 个结果`
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
      <div className="search-summary" aria-live="polite">{summary}</div>
      <div className={`panel search-results${hasResults ? "" : " is-empty"}`}>
        {!searchable ? <p className="search-empty">请输入至少 1 个中文字符，或 3 个英文/数字字符。</p> : null}
        {searchable && records === null ? <p className="search-empty">正在载入搜索索引。</p> : null}
        {searchable && records ? results.map((record) => (
          <Link className="search-result" href={record.route} key={record.articleKey}>
            <div><strong>{record.title}</strong><p>{record.moduleTitle} · {getArticleStatusLabel(record.status)}</p></div>
            <span>{record.articleKey}</span>
          </Link>
        )) : null}
        {searchable && records && results.length === 0 ? <p className="search-empty">没有找到同时包含这些关键词的文章。</p> : null}
      </div>
    </div>
  );
}
