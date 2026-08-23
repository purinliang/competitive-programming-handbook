import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const appRoot = process.cwd();
const contentRoot = process.env.HANDBOOK_CONTENT_ROOT
  ? path.resolve(process.env.HANDBOOK_CONTENT_ROOT)
  : path.join(appRoot, "public/content");
const publishStatePath = process.env.HANDBOOK_PUBLISH_STATE_PATH
  ? path.resolve(process.env.HANDBOOK_PUBLISH_STATE_PATH)
  : path.join(appRoot, ".content-cache/r2-publish-state.json");
const bucketName = process.env.HANDBOOK_CONTENT_BUCKET
  ?? "handbook-content";
const publishNow = Number(
  process.env.HANDBOOK_PUBLISH_NOW ?? Date.now(),
);
const retainedReleaseCount = Number(
  process.env.HANDBOOK_CONTENT_RETAIN_RELEASES ?? 2,
);
const uploadConcurrency = Number(
  process.env.HANDBOOK_CONTENT_UPLOAD_CONCURRENCY ?? 2,
);
const arguments_ = new Set(process.argv.slice(2));
const allowedArguments = new Set(["--dry-run", "--local", "--remote"]);
const unknownArguments = [...arguments_].filter(
  (argument) => !allowedArguments.has(argument),
);

if (
  unknownArguments.length > 0
  || arguments_.has("--local") && arguments_.has("--remote")
  || !Number.isFinite(publishNow)
  || !Number.isInteger(retainedReleaseCount)
  || retainedReleaseCount < 1
  || !Number.isInteger(uploadConcurrency)
  || uploadConcurrency < 1
) {
  throw new Error(
    "用法：node scripts/publish-content.mjs "
      + "[--dry-run] [--local|--remote]",
  );
}

const dryRun = arguments_.has("--dry-run");
const targetFlag = arguments_.has("--local") ? "--local" : "--remote";
const targetArguments = [targetFlag];
if (targetFlag === "--local" && process.env.HANDBOOK_R2_PERSIST_TO) {
  targetArguments.push(
    "--persist-to",
    path.resolve(process.env.HANDBOOK_R2_PERSIST_TO),
  );
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function contentKey(objectPath) {
  const prefix = "/content/";
  if (!objectPath.startsWith(prefix) || objectPath.includes("..")) {
    throw new Error(`正文对象路径无效：${objectPath}`);
  }
  return objectPath.slice(prefix.length);
}

function runWrangler(parameters, { allowFailure = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "pnpm",
      ["exec", "wrangler", ...parameters],
      { cwd: appRoot, env: process.env },
    );
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("exit", (code) => {
      const result = {
        code: code ?? 1,
        stderr: Buffer.concat(stderr).toString("utf8"),
        stdout: Buffer.concat(stdout).toString("utf8"),
      };
      if (result.code === 0 || allowFailure) {
        resolve(result);
        return;
      }
      reject(new Error(
        `Wrangler 执行失败：${parameters.join(" ")}\n`
          + `${result.stderr}${result.stdout}`,
      ));
    });
  });
}

async function readPublishedState() {
  const result = await runWrangler([
    "r2",
    "object",
    "get",
    `${bucketName}/publish-state.json`,
    ...targetArguments,
    "--pipe",
  ], { allowFailure: true });
  if (result.code !== 0) return undefined;
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error("R2 中的 publish-state.json 不是有效 JSON");
  }
}

async function deleteObject(key) {
  await runWrangler([
    "r2",
    "object",
    "delete",
    `${bucketName}/${key}`,
    ...targetArguments,
  ]);
}

async function putObject(key, filePath, immutable = false) {
  await runWrangler([
    "r2",
    "object",
    "put",
    `${bucketName}/${key}`,
    ...targetArguments,
    "--file",
    filePath,
    "--content-type",
    "application/json; charset=utf-8",
    "--cache-control",
    immutable
      ? "public, max-age=31536000, immutable"
      : "public, max-age=60, must-revalidate",
  ]);
}

async function forEachConcurrent(items, concurrency, operation) {
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await operation(items[index], index);
    }
  }
  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, items.length) },
      () => worker(),
    ),
  );
}

function formatDuration(milliseconds) {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0
    ? `${minutes}m${String(remainingSeconds).padStart(2, "0")}s`
    : `${remainingSeconds}s`;
}

function uploadProgress(completed, total, startedAt) {
  const width = 20;
  const ratio = total === 0 ? 1 : completed / total;
  const filled = Math.round(width * ratio);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  return `[${bar}] ${completed}/${total} `
    + `${Math.round(ratio * 100)}%  已用 `
    + formatDuration(Date.now() - startedAt);
}

async function reachableObjectPaths(release) {
  const paths = new Set(
    [
      release.articleManifest,
      release.interactionManifest,
      release.learningProgress,
      release.navigation,
      release.searchIndex,
    ].map((object) => object.objectPath),
  );
  const articleManifest = await readJson(path.join(
    contentRoot,
    contentKey(release.articleManifest.objectPath),
  ));
  for (const variants of Object.values(articleManifest.articles)) {
    for (const variant of Object.values(variants)) {
      paths.add(variant.objectPath);
      if (variant.quiz) paths.add(variant.quiz.objectPath);
    }
  }
  const interactionManifest = await readJson(path.join(
    contentRoot,
    contentKey(release.interactionManifest.objectPath),
  ));
  for (const document of Object.values(interactionManifest.documents)) {
    paths.add(document.objectPath);
  }
  return [...paths].sort();
}

function normalizeReleaseRecords(state) {
  if (state?.version === 2 && Array.isArray(state.releases)) {
    return state.releases.map((release) => ({
      objectPaths: [...new Set(release.objectPaths ?? [])].sort(),
      publishedAt: Number(release.publishedAt) || publishNow,
      releaseId: String(release.releaseId),
      releasePath: release.releasePath
        ?? `releases/${release.releaseId}.json`,
    }));
  }
  if (state?.releaseId && Array.isArray(state.objectPaths)) {
    return [{
      objectPaths: [...new Set(state.objectPaths)].sort(),
      publishedAt: publishNow,
      releaseId: String(state.releaseId),
      releasePath: `releases/${state.releaseId}.json`,
    }];
  }
  return [];
}

function partitionReleaseRecords(releases, currentReleaseId) {
  const sorted = [...releases].sort(
    (left, right) => right.publishedAt - left.publishedAt,
  );
  const retained = [];
  const expired = [];
  for (const [index, release] of sorted.entries()) {
    if (
      release.releaseId === currentReleaseId
      || index < retainedReleaseCount
    ) {
      retained.push(release);
    } else {
      expired.push(release);
    }
  }
  return { expired, retained };
}

function staleObjectPaths(expired, retained) {
  const retainedObjects = new Set(
    retained.flatMap((release) => release.objectPaths),
  );
  return [...new Set(
    expired.flatMap((release) => release.objectPaths),
  )].filter((objectPath) => !retainedObjects.has(objectPath)).sort();
}

async function writePublishedState(releases, releaseId) {
  const publishState = {
    currentReleaseId: releaseId,
    releases,
    retention: {
      releases: retainedReleaseCount,
    },
    version: 2,
  };
  await mkdir(path.dirname(publishStatePath), { recursive: true });
  await writeFile(publishStatePath, `${JSON.stringify(publishState)}\n`);
  await putObject("publish-state.json", publishStatePath);
}

async function main() {
  const release = await readJson(path.join(contentRoot, "release.json"));
  const objectPaths = await reachableObjectPaths(release);
  const previousState = await readPublishedState();
  const releases = normalizeReleaseRecords(previousState);
  let releaseRecord = releases.find(
    (record) => record.releaseId === release.releaseId,
  );
  const newRelease = !releaseRecord;
  if (!releaseRecord) {
    releaseRecord = {
      objectPaths,
      publishedAt: publishNow,
      releaseId: release.releaseId,
      releasePath: `releases/${release.releaseId}.json`,
    };
    releases.push(releaseRecord);
  }

  const previousObjects = new Set(
    releases
      .filter(
        (record) => !newRelease || record.releaseId !== release.releaseId,
      )
      .flatMap((record) => record.objectPaths),
  );
  const missingObjects = objectPaths.filter(
    (objectPath) => !previousObjects.has(objectPath),
  );
  const switchingRelease = previousState?.currentReleaseId
    !== release.releaseId;
  const { expired, retained } = partitionReleaseRecords(
    releases,
    release.releaseId,
  );
  const staleObjects = staleObjectPaths(expired, retained);
  console.log(
    `正文发布版本 ${release.releaseId}：`
      + `${missingObjects.length} 个新对象，`
      + `${objectPaths.length - missingObjects.length} 个对象可复用；`
      + `${staleObjects.length} 个失效对象等待安全回收。`,
  );
  if (dryRun) return;

  if (
    !switchingRelease
    && missingObjects.length === 0
    && staleObjects.length === 0
    && expired.length === 0
  ) {
    console.log(`正文发布版本 ${release.releaseId} 已经在线，无需上传。`);
    return;
  }

  const concurrency = targetFlag === "--local" ? 1 : uploadConcurrency;
  const uploadStartedAt = Date.now();
  let uploadedObjects = 0;
  await forEachConcurrent(
    missingObjects,
    concurrency,
    async (objectPath) => {
      const key = contentKey(objectPath);
      await putObject(key, path.join(contentRoot, key), true);
      uploadedObjects += 1;
      if (
        uploadedObjects % 25 === 0
        || uploadedObjects === missingObjects.length
      ) {
        console.log(uploadProgress(
          uploadedObjects,
          missingObjects.length,
          uploadStartedAt,
        ));
      }
    },
  );

  if (newRelease) {
    await putObject(
      releaseRecord.releasePath,
      path.join(contentRoot, "release.json"),
      true,
    );
  }

  if (switchingRelease) {
    const compatibilityFiles = [
      "article-manifest.json",
      "interaction-manifest.json",
      "learning-progress.json",
      "navigation.json",
      "search-index.json",
    ];
    for (const name of compatibilityFiles) {
      await putObject(name, path.join(contentRoot, name));
    }
    await putObject("release.json", path.join(contentRoot, "release.json"));
  }

  await writePublishedState(releases, release.releaseId);

  await forEachConcurrent(
    staleObjects,
    concurrency,
    async (objectPath) => deleteObject(contentKey(objectPath)),
  );
  await forEachConcurrent(
    expired,
    concurrency,
    async (record) => deleteObject(record.releasePath),
  );
  if (expired.length > 0) {
    await writePublishedState(retained, release.releaseId);
    console.log(
      `已回收 ${staleObjects.length} 个失效对象和 `
        + `${expired.length} 个过期版本快照。`,
    );
  }
  console.log(`正文发布版本 ${release.releaseId} 已完成原子切换。`);
}

await main();
