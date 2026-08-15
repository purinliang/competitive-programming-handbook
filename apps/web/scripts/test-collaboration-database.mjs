import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const resultPath = process.argv[2];
assert(resultPath, "缺少 D1 查询结果路径");

const execution = JSON.parse(await readFile(resultPath, "utf8"));
const row = execution[0]?.results?.[0];

assert(row, "D1 没有返回协作状态统计");
assert.equal(row.currentCount, 1, "当前小节已阅记录应当只有一份");
assert.equal(row.historyCount, 1, "替换当前已阅状态时应当归档旧记录");

console.log("协作学习 D1 历史记录测试通过。");
