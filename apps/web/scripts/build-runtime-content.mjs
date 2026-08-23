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

function jsonSource(value) {
  return `${JSON.stringify(value)}\n`;
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

async function writeMutable(name, source) {
  const temporaryPath = path.join(outputRoot, `${name}.tmp`);
  await writeFile(temporaryPath, source);
  await rename(temporaryPath, path.join(outputRoot, name));
}

async function verifyObject(object) {
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

async function buildInteractionManifest() {
  const source = JSON.parse(await readFile(
    path.join(cacheRoot, "interaction-manifest.json"),
    "utf8",
  ));
  const documents = {};

  for (const [documentKey, document] of Object.entries(source.documents)) {
    const object = await writeObject(jsonSource(document));
    documents[documentKey] = {
      ...object,
      articleKey: document.articleKey,
      contentRevision: document.contentRevision,
      documentEpoch: document.documentEpoch,
      questions: document.questions ?? [],
    };
  }

  return { documents, version: 1 };
}

async function main() {
  const sourceManifest = JSON.parse(await readFile(
    path.join(cacheRoot, "manifest.json"),
    "utf8",
  ));
  const articleManifest = {
    articles: {},
    version: 2,
  };
  let articleCount = 0;
  let quizCount = 0;

  await mkdir(objectRoot, { recursive: true });

  for (const article of sourceManifest.articles) {
    if (!article.exists || ["计划", "推迟"].includes(article.status)) {
      continue;
    }

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

    articleManifest.articles[article.articleKey] = variants;
    articleCount += 1;
  }

  const interactionManifest = await buildInteractionManifest();
  const publicationSources = {
    articleManifest: jsonSource(articleManifest),
    interactionManifest: jsonSource(interactionManifest),
    learningProgress: await readFile(
      path.join(appRoot, "public/learning-progress.json"),
      "utf8",
    ),
    navigation: jsonSource(sourceManifest),
    searchIndex: await readFile(
      path.join(appRoot, "public/search-index.json"),
      "utf8",
    ),
  };
  const publications = {};
  for (const [name, source] of Object.entries(publicationSources)) {
    publications[name] = await writeObject(source);
  }

  const releaseWithoutId = {
    ...publications,
    version: 1,
  };
  const release = {
    ...releaseWithoutId,
    releaseId: sha256(jsonSource(releaseWithoutId)).slice(0, 16),
  };

  const compatibilityFiles = {
    "article-manifest.json": publicationSources.articleManifest,
    "interaction-manifest.json": publicationSources.interactionManifest,
    "learning-progress.json": publicationSources.learningProgress,
    "navigation.json": publicationSources.navigation,
    "search-index.json": publicationSources.searchIndex,
  };
  for (const [name, source] of Object.entries(compatibilityFiles)) {
    await writeMutable(name, source);
  }
  await writeMutable("release.json", jsonSource(release));

  const references = [
    ...Object.values(publications),
    ...Object.values(interactionManifest.documents),
  ];
  for (const variants of Object.values(articleManifest.articles)) {
    for (const variant of Object.values(variants)) {
      references.push(variant);
      if (variant.quiz) references.push(variant.quiz);
    }
  }
  for (const object of references) {
    await verifyObject(object);
  }

  console.log(
    `运行时内容：生成 ${articleCount} 篇文章、`
      + `${articleCount * 2} 个正文版本、${quizCount} 份小测和 `
      + `${Object.keys(interactionManifest.documents).length} 份交互定义；`
      + `发布版本 ${release.releaseId}。`,
  );
}

await main();
