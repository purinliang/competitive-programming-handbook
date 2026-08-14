import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const appRoot = process.cwd();
const notesRoot = path.resolve(appRoot, "../../notes");
const catalog = await readFile(path.join(notesRoot, "CATALOG.md"), "utf8");
const outputPath = path.join(appRoot, "public/search-index.json");
const records = [];
let moduleTitle = "";

function extractPath(cell) {
  return cell.match(/\]\(([^)]+\.md)(?:#[^)]+)?\)/)?.[1];
}

function searchableText(markdown) {
  return markdown
    .replace(/^>\s*(?:最近修订|状态)：.*$/gm, "")
    .replace(/```[^\n]*\n?/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#|$\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

  const markdown = await readFile(path.join(notesRoot, sourcePath), "utf8");
  const articleKey = sourcePath.replace(/\.md$/, "");
  records.push({
    articleKey,
    title: cells[1],
    moduleTitle,
    route: `/${articleKey}/`,
    status: cells[2],
    text: searchableText(markdown),
  });
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(records)}\n`);
