import assert from "node:assert/strict";

import {
  getSearchDelay,
  NORMAL_QUERY_DELAY_MS,
  rankSearchRecords,
  SHORT_QUERY_DELAY_MS,
} from "../src/lib/search-ranking.ts";

import type { SearchRecord } from "../src/lib/search-ranking.ts";

function record(
  title: string,
  bodyText: string,
  headingText = "",
): SearchRecord {
  return {
    articleKey: title,
    bodyText: bodyText.toLocaleLowerCase("zh-CN"),
    headingText: headingText.toLocaleLowerCase("zh-CN"),
    moduleTitle: "数据结构",
    route: "/",
    status: "待审阅",
    title,
  };
}

const records = [
  record("稀疏表（ST 表）", "ST 表支持静态区间查询。"),
  record("stack", "stack 是栈的标准库适配器。"),
  record("string", "string 是字符串类型。"),
  record("Nim、SG 函数与基础博弈论", "SG 函数描述后继状态。"),
  record("无关文章", "first 表格只是两个相邻词。"),
  record("标题未命中", "普通正文只提到一次 target。"),
  record("正文多次命中", "target 在正文中反复出现；这是第二个 target。"),
  record("二级标题命中", "正文没有这个词。", "target 的原理"),
];

function titles(query: string): string[] {
  return rankSearchRecords(records, query).records.map((item) => item.title);
}

assert.deepEqual(titles("st表"), ["稀疏表（ST 表）"]);
assert.deepEqual(titles("ST表"), ["稀疏表（ST 表）"]);
assert.equal(titles("st")[0], "稀疏表（ST 表）");
assert.equal(titles("ST")[0], "稀疏表（ST 表）");
assert(titles("st").includes("stack"));
assert(titles("st").includes("string"));
assert.deepEqual(titles("sg函数"), ["Nim、SG 函数与基础博弈论"]);
assert.deepEqual(titles("SG"), ["Nim、SG 函数与基础博弈论"]);
assert.deepEqual(titles("target"), ["二级标题命中", "正文多次命中"]);
assert.equal(rankSearchRecords(records, "target", 1).records.length, 1);
assert.equal(rankSearchRecords(records, "target", 1).total, 2);
assert.equal(getSearchDelay("st"), SHORT_QUERY_DELAY_MS);
assert.equal(getSearchDelay("123"), NORMAL_QUERY_DELAY_MS);
assert.equal(getSearchDelay("表"), NORMAL_QUERY_DELAY_MS);
assert.equal(getSearchDelay(""), 0);

console.log("搜索规则单元测试通过。");
