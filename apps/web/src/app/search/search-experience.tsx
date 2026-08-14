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
  const [records, setRecords] = useState<SearchRecord[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetch("/search-index.json").then((response) => response.json()).then(setRecords);
  }, []);

  const results = useMemo(() => {
    const terms = query.trim().toLocaleLowerCase("zh-CN").split(/\s+/).filter(Boolean);
    if (terms.length === 0) {
      return [];
    }
    return records
      .map((record) => ({ record, score: rank(record, terms) }))
      .filter((item) => item.score >= 0)
      .sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title, "zh-CN"))
      .slice(0, 60)
      .map((item) => item.record);
  }, [query, records]);

  return (
    <div>
      <label className="search-box">
        <Search aria-hidden="true" size={19} />
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、概念或代码名称" />
      </label>
      <div className="search-summary">
        {query.trim() ? `${results.length} 个结果` : `已索引 ${records.length} 篇文章`}
      </div>
      <div className="panel search-results">
        {query.trim() ? results.map((record) => (
          <Link className="search-result" href={record.route} key={record.articleKey}>
            <div><strong>{record.title}</strong><p>{record.moduleTitle} · {record.status}</p></div>
            <span>{record.articleKey}</span>
          </Link>
        )) : <p className="search-empty">输入一个知识点、算法名称或代码标识符开始搜索。</p>}
        {query.trim() && results.length === 0 ? <p className="search-empty">没有找到同时包含这些关键词的文章。</p> : null}
      </div>
    </div>
  );
}
