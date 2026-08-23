import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  access,
  readFile,
  readdir,
} from "node:fs/promises";
import path from "node:path";

const appRoot = process.cwd();
const contentRoot = path.join(appRoot, "public/content");
const outputRoot = path.join(appRoot, "out");

function sha256(source) {
  return createHash("sha256").update(source).digest("hex");
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function verifyObject(object, expected = {}) {
  assert.match(object.contentHash, /^[0-9a-f]{64}$/u);
  assert.equal(
    object.objectPath,
    `/content/objects/${object.contentHash}.json`,
  );
  const source = await readFile(path.join(
    appRoot,
    "public",
    object.objectPath.slice(1),
  ));
  assert.equal(sha256(source), object.contentHash);
  const parsed = JSON.parse(source);
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(parsed[key], value);
  }
}

const [articleManifest, navigationManifest] = await Promise.all([
  readJson(path.join(contentRoot, "article-manifest.json")),
  readJson(path.join(contentRoot, "navigation.json")),
]);
assert.equal(articleManifest.version, 2);

const published = navigationManifest.articles.filter((article) => (
  article.exists && !["计划", "推迟"].includes(article.status)
));
assert.equal(Object.keys(articleManifest.articles).length, published.length);

const checkedObjects = new Set();
for (const article of published) {
  const variants = articleManifest.articles[article.articleKey];
  assert(variants, `正文清单缺少 ${article.articleKey}`);
  for (const mode of ["catalog", "learning-path"]) {
    const variant = variants[mode];
    assert(variant, `${article.articleKey} 缺少 ${mode} 正文`);
    if (!checkedObjects.has(variant.objectPath)) {
      await verifyObject(variant, {
        contentRevision: variant.contentRevision,
        documentEpoch: variant.documentEpoch,
      });
      checkedObjects.add(variant.objectPath);
    }
  }
  const quiz = variants["learning-path"].quiz;
  if (quiz && !checkedObjects.has(quiz.objectPath)) {
    await verifyObject(quiz, { revision: quiz.revision });
    checkedObjects.add(quiz.objectPath);
  }
}

await Promise.all([
  access(path.join(contentRoot, "learning-progress.json")),
  access(path.join(contentRoot, "search-index.json")),
]);

const readerHtml = await readFile(
  path.join(outputRoot, "reader/index.html"),
  "utf8",
);
assert.match(readerHtml, /article-runtime-loading/u);
assert.doesNotMatch(readerHtml, /data-content-revision=/u);
assert.doesNotMatch(readerHtml, /<article[^>]+markdown-body[^>]*>\s*<h1/u);

for (const directory of ["catalog", "learning-path"]) {
  const entries = await readdir(path.join(outputRoot, directory), {
    withFileTypes: true,
  });
  assert.equal(
    entries.some((entry) => entry.isDirectory()),
    false,
    `${directory} 仍然包含按文章生成的静态目录`,
  );
}

console.log(
  `运行时内容检查通过：${published.length} 篇文章复用 `
    + `${checkedObjects.size} 个内容对象。`,
);
