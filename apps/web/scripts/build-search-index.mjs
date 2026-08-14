import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const appRoot = process.cwd();
const notesRoot = path.resolve(appRoot, "../../notes");
const catalog = await readFile(path.join(notesRoot, "CATALOG.md"), "utf8");
const outputPath = path.join(appRoot, "public/search-index.json");
const records = [];
const articles = [];

function extractPath(cell) {
  return cell.match(/\]\(([^)]+\.md)(?:#[^)]+)?\)/)?.[1];
}

function searchableText(markdown, articleTitles) {
  return markdown
    .replace(/^>\s*(?:最近修订|状态)：.*$/gm, "")
    .replace(/^##\s+(?:上一篇|下一篇|返回[^\n]*)\s*$[\s\S]*$/gm, "")
    .replace(/(?:上一篇|下一篇|返回基础篇)/g, " ")
    .replace(/```[^\n]*\n?/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, (_, label) => articleTitles.has(label.trim()) ? " " : label)
    .replace(/[`*_>#|$\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

let moduleTitle = "";
for (const line of catalog.split("\n")) {
  const moduleMatch = line.match(/^##\s+\d+\s+(.+)$/);
  if (moduleMatch) {
    moduleTitle = moduleMatch[1].trim();
    continue;
  }
  if (!/^\|\s*\d/.test(line)) {
    continue;
  }

  const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
  if (cells.length !== 4 || cells[2] === "计划") {
    continue;
  }

  const sourcePath = extractPath(cells[3]);
  if (!sourcePath) {
    continue;
  }

  const articleKey = sourcePath.replace(/\.md$/, "");
  articles.push({
    articleKey,
    title: cells[1],
    moduleTitle,
    route: `/${articleKey}/`,
    status: cells[2],
  });
}

const articleTitles = new Set(articles.map((article) => article.title));
for (const article of articles) {
  const markdown = await readFile(path.join(notesRoot, `${article.articleKey}.md`), "utf8");
  records.push({ ...article, text: searchableText(markdown, articleTitles) });
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(records)}\n`);
