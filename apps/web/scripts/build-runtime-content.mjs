import { createHash } from "node:crypto";
import {
  access,
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const appRoot = process.cwd();
const cacheRoot = path.join(appRoot, ".content-cache");
const outputRoot = path.join(appRoot, "public/content");
const objectRoot = path.join(outputRoot, "objects");
const configPath = path.join(appRoot, "runtime-content.json");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function sha256(source) {
  return createHash("sha256").update(source).digest("hex");
}

async function writeObject(source) {
  const contentHash = sha256(source);
  const objectName = `${contentHash}.json`;
  const objectPath = path.join(objectRoot, objectName);
  if (!(await exists(objectPath))) {
    await writeFile(objectPath, source);
  }
  return {
    bytes: Buffer.byteLength(source),
    contentHash,
    objectPath: `/content/objects/${objectName}`,
  };
}

async function main() {
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const sourceManifest = JSON.parse(await readFile(
    path.join(cacheRoot, "manifest.json"),
    "utf8",
  ));
  const articlesByKey = new Map(
    sourceManifest.articles.map((article) => [article.articleKey, article]),
  );
  const manifest = {
    articles: {},
    version: 1,
  };

  await mkdir(objectRoot, { recursive: true });

  for (const articleKey of config.articles) {
    const article = articlesByKey.get(articleKey);
    if (!article?.exists || ["计划", "推迟"].includes(article.status)) {
      throw new Error(`运行时正文不存在或尚未发表：${articleKey}`);
    }

    const variants = {};
    for (const mode of ["catalog", "learning-path"]) {
      const cachePath = path.join(
        cacheRoot,
        "articles",
        mode,
        `${articleKey}.json`,
      );
      const source = await readFile(cachePath, "utf8");
      const rendered = JSON.parse(source);
      if (!rendered.html || !rendered.contentRevision) {
        throw new Error(`正文对象缺少必要字段：${articleKey} (${mode})`);
      }
      variants[mode] = {
        ...await writeObject(source),
        contentRevision: rendered.contentRevision,
        documentEpoch: rendered.documentEpoch,
      };
    }
    manifest.articles[articleKey] = variants;
  }

  const manifestSource = `${JSON.stringify(manifest)}\n`;
  const temporaryPath = path.join(outputRoot, "article-manifest.tmp.json");
  const manifestPath = path.join(outputRoot, "article-manifest.json");
  await writeFile(temporaryPath, manifestSource);
  await rename(temporaryPath, manifestPath);

  for (const variants of Object.values(manifest.articles)) {
    for (const variant of Object.values(variants)) {
      const objectPath = path.join(
        appRoot,
        "public",
        variant.objectPath.replace(/^\//u, ""),
      );
      const source = await readFile(objectPath, "utf8");
      if (sha256(source) !== variant.contentHash) {
        throw new Error(`正文对象哈希校验失败：${variant.objectPath}`);
      }
    }
  }

  console.log(
    `运行时正文：生成 ${config.articles.length} 篇文章、`
      + `${config.articles.length * 2} 个导航版本。`,
  );
}

await main();
