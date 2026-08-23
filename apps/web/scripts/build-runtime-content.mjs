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
  const sourceManifest = JSON.parse(await readFile(
    path.join(cacheRoot, "manifest.json"),
    "utf8",
  ));
  const manifest = {
    articles: {},
    version: 2,
  };
  let articleCount = 0;
  let quizCount = 0;

  await mkdir(objectRoot, { recursive: true });

  for (const article of sourceManifest.articles) {
    if (!article.exists || ["计划", "推迟"].includes(article.status)) continue;

    const variants = {};
    for (const mode of ["catalog", "learning-path"]) {
      const cachePath = path.join(
        cacheRoot,
        "articles",
        mode,
        `${article.articleKey}.json`,
      );
      const source = await readFile(cachePath, "utf8");
      const rendered = JSON.parse(source);
      if (!rendered.html || !rendered.contentRevision) {
        throw new Error(
          `正文对象缺少必要字段：${article.articleKey} (${mode})`,
        );
      }
      variants[mode] = {
        ...await writeObject(source),
        contentRevision: rendered.contentRevision,
        documentEpoch: rendered.documentEpoch,
      };
    }

    const quizPath = path.join(
      cacheRoot,
      "quizzes",
      `${article.articleKey}.json`,
    );
    if (await exists(quizPath)) {
      const quizSource = await readFile(quizPath, "utf8");
      const quiz = JSON.parse(quizSource);
      variants["learning-path"].quiz = {
        ...await writeObject(quizSource),
        revision: quiz.revision,
      };
      quizCount += 1;
    }

    manifest.articles[article.articleKey] = variants;
    articleCount += 1;
  }

  const publications = [
    {
      name: "article-manifest.json",
      source: `${JSON.stringify(manifest)}\n`,
    },
    {
      name: "navigation.json",
      source: `${JSON.stringify(sourceManifest)}\n`,
    },
    {
      name: "search-index.json",
      source: await readFile(
        path.join(appRoot, "public/search-index.json"),
        "utf8",
      ),
    },
    {
      name: "learning-progress.json",
      source: await readFile(
        path.join(appRoot, "public/learning-progress.json"),
        "utf8",
      ),
    },
  ];

  for (const publication of publications) {
    const temporaryPath = path.join(
      outputRoot,
      `${publication.name}.tmp`,
    );
    await writeFile(temporaryPath, publication.source);
    await rename(temporaryPath, path.join(outputRoot, publication.name));
  }

  for (const variants of Object.values(manifest.articles)) {
    for (const variant of Object.values(variants)) {
      for (const object of [variant, variant.quiz].filter(Boolean)) {
        const objectPath = path.join(
          appRoot,
          "public",
          object.objectPath.replace(/^\//u, ""),
        );
        const source = await readFile(objectPath, "utf8");
        if (sha256(source) !== object.contentHash) {
          throw new Error(`内容对象哈希校验失败：${object.objectPath}`);
        }
      }
    }
  }

  console.log(
    `运行时内容：生成 ${articleCount} 篇文章、`
      + `${articleCount * 2} 个正文版本和 ${quizCount} 份小测。`,
  );
}

await main();
