import { createHash } from "node:crypto";
import {
  access,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const appRoot = process.cwd();
const notesRoot = path.resolve(appRoot, "../../notes");
const cacheRoot = path.join(appRoot, ".content-cache");
const outputRoot = path.join(appRoot, ".content-object-prototype");
const objectRoot = path.join(outputRoot, "objects");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function filesBelow(root) {
  if (!(await exists(root))) {
    return [];
  }
  const entries = await readdir(root, {
    recursive: true,
    withFileTypes: true,
  });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}

async function sizeOfFiles(files) {
  let bytes = 0;
  for (const filePath of files) {
    bytes += (await stat(filePath)).size;
  }
  return bytes;
}

function hashObject(value) {
  return createHash("sha256").update(value).digest("hex");
}

function routeVariant(article, mode) {
  if (mode === "catalog") {
    return {
      route: article.catalogRoute,
      title: article.title,
    };
  }
  return {
    route: article.learningPathRoute,
    title: article.learningTitle,
  };
}

async function writeContentObject(source) {
  const hash = hashObject(source);
  const relativePath = `objects/${hash}.json`;
  const outputPath = path.join(outputRoot, relativePath);
  const alreadyExists = await exists(outputPath);
  if (!alreadyExists) {
    await writeFile(outputPath, source);
  }
  return { alreadyExists, hash, relativePath };
}

function shellHtml() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>算法竞赛手册</title>
  <link rel="stylesheet" href="/runtime-content/shell.css">
</head>
<body>
  <header>算法竞赛手册</header>
  <main id="article" aria-busy="true">
    <p class="loading">正在读取正文……</p>
  </main>
  <script type="module" src="/runtime-content/shell.js"></script>
</body>
</html>
`;
}

function shellCss() {
  return `:root { color-scheme: dark; }
body {
  margin: 0;
  background: #0b0f17;
  color: #d8e0ec;
  font: 16px/1.75 system-ui, sans-serif;
}
header, main { width: min(900px, calc(100% - 32px)); margin: auto; }
header { padding: 20px 0; color: #7fb5ff; }
.loading { color: #78869a; }
`;
}

function shellJavaScript() {
  return `const articleRoot = document.querySelector("#article");

function currentArticle() {
  const parts = location.pathname.split("/").filter(Boolean);
  if (parts.length < 3) return;
  const mode = parts[0] === "catalog" ? "catalog" : "learningPath";
  return { articleKey: parts.slice(1).join("/"), mode };
}

function restoreLegacyEntry() {
  const url = new URL(location.href);
  const entryKey = url.searchParams.get("entry");
  if (!entryKey) return;
  url.searchParams.delete("entry");
  history.replaceState(
    { ...(history.state ?? {}), handbookEntryKey: entryKey },
    "",
    url.pathname + url.search + url.hash,
  );
}

async function loadArticle() {
  const current = currentArticle();
  if (!current) throw new Error("文章路径无效");
  const manifestResponse = await fetch(
    "/runtime-content/article-manifest.json",
  );
  if (!manifestResponse.ok) throw new Error("正文索引暂时无法读取");
  const manifest = await manifestResponse.json();
  const variant = manifest.articles[current.articleKey]?.[current.mode];
  if (!variant) throw new Error("文章不存在");
  const articleResponse = await fetch(
    "/runtime-content/" + variant.objectPath,
  );
  if (!articleResponse.ok) throw new Error("正文暂时无法读取");
  const article = await articleResponse.json();
  document.title = variant.title + " · 算法竞赛手册";
  articleRoot.dataset.articleKey = current.articleKey;
  articleRoot.dataset.contentRevision = article.contentRevision;
  articleRoot.innerHTML = article.html;
  articleRoot.setAttribute("aria-busy", "false");
}

restoreLegacyEntry();
loadArticle().catch((error) => {
  articleRoot.innerHTML = "<p>" + error.message + "</p>";
  articleRoot.setAttribute("aria-busy", "false");
});
`;
}

async function main() {
  const manifestPath = path.join(cacheRoot, "manifest.json");
  if (!(await exists(manifestPath))) {
    throw new Error("缺少 .content-cache，请先运行 pnpm content:prepare");
  }

  await mkdir(objectRoot, { recursive: true });
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const articleManifest = { articles: {}, version: 1 };
  const referencedObjectPaths = new Set();
  const referencedObjects = new Set();
  const referencedQuizObjects = new Set();
  let createdObjects = 0;
  let reusedObjects = 0;
  let variants = 0;

  for (const article of manifest.articles) {
    if (!article.exists || ["计划", "推迟"].includes(article.status)) {
      continue;
    }
    const record = {};
    for (const mode of ["catalog", "learning-path"]) {
      const cachePath = path.join(
        cacheRoot,
        "articles",
        mode,
        `${article.articleKey}.json`,
      );
      if (!(await exists(cachePath))) {
        continue;
      }
      const source = await readFile(cachePath, "utf8");
      const object = await writeContentObject(source);
      const variant = routeVariant(article, mode);
      record[mode === "catalog" ? "catalog" : "learningPath"] = {
        contentHash: object.hash,
        objectPath: object.relativePath,
        route: variant.route,
        title: article.kind === "extension"
          ? `*${variant.title}`
          : variant.title,
      };
      variants += 1;
      if (referencedObjects.has(object.hash) || object.alreadyExists) {
        reusedObjects += 1;
      } else {
        createdObjects += 1;
      }
      referencedObjects.add(object.hash);
      referencedObjectPaths.add(object.relativePath);
    }

    const quizPath = path.join(
      cacheRoot,
      "quizzes",
      `${article.articleKey}.json`,
    );
    if (record.learningPath && await exists(quizPath)) {
      const quiz = await writeContentObject(await readFile(quizPath, "utf8"));
      record.learningPath.quizObjectPath = quiz.relativePath;
      referencedQuizObjects.add(quiz.hash);
      referencedObjectPaths.add(quiz.relativePath);
    }
    articleManifest.articles[article.articleKey] = record;
  }

  const articleManifestSource = `${JSON.stringify(articleManifest)}\n`;
  await Promise.all([
    writeFile(
      path.join(outputRoot, "article-manifest.json"),
      articleManifestSource,
    ),
    writeFile(path.join(outputRoot, "navigation.json"), await readFile(manifestPath)),
    writeFile(path.join(outputRoot, "shell.html"), shellHtml()),
    writeFile(path.join(outputRoot, "shell.css"), shellCss()),
    writeFile(path.join(outputRoot, "shell.js"), shellJavaScript()),
    writeFile(
      path.join(outputRoot, "search-index.json"),
      await readFile(path.join(appRoot, "public/search-index.json")),
    ),
    writeFile(
      path.join(outputRoot, "learning-progress.json"),
      await readFile(path.join(appRoot, "public/learning-progress.json")),
    ),
  ]);

  const markdownFiles = (await filesBelow(notesRoot)).filter(
    (filePath) => filePath.endsWith(".md"),
  );
  const cacheFiles = await filesBelow(cacheRoot);
  const currentOutputFiles = await filesBelow(path.join(appRoot, "out"));
  const storedPrototypeFiles = (await filesBelow(outputRoot)).filter(
    (filePath) => path.basename(filePath) !== "report.json",
  );
  const liveObjectFiles = [...referencedObjectPaths].map(
    (relativePath) => path.join(outputRoot, relativePath),
  );
  const livePrototypeFiles = [
    ...storedPrototypeFiles.filter(
      (filePath) => !filePath.startsWith(`${objectRoot}${path.sep}`),
    ),
    ...liveObjectFiles,
  ];
  const objectFiles = await filesBelow(objectRoot);
  const liveBytes = await sizeOfFiles(livePrototypeFiles);
  let liveGzipBytes = 0;
  for (const filePath of livePrototypeFiles) {
    liveGzipBytes += gzipSync(await readFile(filePath)).byteLength;
  }
  const report = {
    current: {
      contentCacheBytes: await sizeOfFiles(cacheFiles),
      markdownBytes: await sizeOfFiles(markdownFiles),
      markdownFiles: markdownFiles.length,
      staticOutputBytes: await sizeOfFiles(currentOutputFiles),
      staticOutputFiles: currentOutputFiles.length,
    },
    prototype: {
      articleVariants: variants,
      liveBytes,
      liveFiles: livePrototypeFiles.length,
      liveGzipBytes,
      manifestBytes: Buffer.byteLength(articleManifestSource),
      shellBytes: Buffer.byteLength(shellHtml()),
      storedBytes: await sizeOfFiles(storedPrototypeFiles),
      storedFiles: storedPrototypeFiles.length,
      storedObjectFiles: objectFiles.length,
      uniqueArticleObjects: referencedObjects.size,
      uniqueQuizObjects: referencedQuizObjects.size,
    },
  };
  await writeFile(
    path.join(outputRoot, "report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  const shell = await readFile(path.join(outputRoot, "shell.html"), "utf8");
  if (/<article\b|markdown-body|data-content-revision/u.test(shell)) {
    throw new Error("共享页面壳意外包含了正文标记");
  }
  if (articleManifestSource.includes('"html"')) {
    throw new Error("文章清单意外包含了正文 HTML");
  }
  for (const record of Object.values(articleManifest.articles)) {
    for (const variant of Object.values(record)) {
      if (!(await exists(path.join(outputRoot, variant.objectPath)))) {
        throw new Error(`正文对象不存在：${variant.objectPath}`);
      }
    }
  }
  for (const relativePath of referencedObjectPaths) {
    const source = await readFile(path.join(outputRoot, relativePath), "utf8");
    if (path.basename(relativePath, ".json") !== hashObject(source)) {
      throw new Error(`正文对象的路径与内容哈希不一致：${relativePath}`);
    }
  }

  console.log(
    `运行时正文原型：${variants} 个导航版本复用 `
      + `${referencedObjects.size} 个正文对象；本次新建 ${createdObjects} 个、`
      + `复用 ${reusedObjects} 个。`,
  );
  console.log(JSON.stringify(report, null, 2));
}

await main();
