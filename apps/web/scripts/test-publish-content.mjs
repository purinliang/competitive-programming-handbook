import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import {
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const appRoot = process.cwd();
const testRoot = path.join(appRoot, ".content-cache/publish-test");
const contentRoot = path.join(testRoot, "content");
const objectRoot = path.join(contentRoot, "objects");

function sha256(source) {
  return createHash("sha256").update(source).digest("hex");
}

function jsonSource(value) {
  return `${JSON.stringify(value)}\n`;
}

async function writeObject(value) {
  const source = jsonSource(value);
  const contentHash = sha256(source);
  await writeFile(path.join(objectRoot, `${contentHash}.json`), source);
  return {
    bytes: Buffer.byteLength(source),
    contentHash,
    objectPath: `/content/objects/${contentHash}.json`,
  };
}

async function writeRelease(bodyText) {
  const body = await writeObject({
    contentRevision: sha256(bodyText).slice(0, 16),
    documentEpoch: 1,
    html: `<h1>${bodyText}</h1>`,
    sections: [],
    tableOfContents: [],
  });
  const interaction = await writeObject({
    articleKey: "test/article",
    contentRevision: body.contentHash.slice(0, 16),
    documentEpoch: 1,
    sections: [],
  });
  const articleManifestValue = {
    articles: {
      "test/article": {
        catalog: {
          ...body,
          contentRevision: body.contentHash.slice(0, 16),
          documentEpoch: 1,
        },
      },
    },
    version: 2,
  };
  const interactionManifestValue = {
    documents: {
      "learning-path:test/article": {
        ...interaction,
        articleKey: "test/article",
        contentRevision: body.contentHash.slice(0, 16),
        documentEpoch: 1,
        questions: [],
      },
    },
    version: 1,
  };
  const publicationValues = {
    articleManifest: articleManifestValue,
    interactionManifest: interactionManifestValue,
    learningProgress: { articles: {} },
    navigation: { articles: [], stages: [] },
    searchIndex: [],
  };
  const publications = {};
  for (const [name, value] of Object.entries(publicationValues)) {
    publications[name] = await writeObject(value);
  }
  const releaseWithoutId = { ...publications, version: 1 };
  const release = {
    ...releaseWithoutId,
    releaseId: sha256(jsonSource(releaseWithoutId)).slice(0, 16),
  };
  const compatibilityNames = {
    articleManifest: "article-manifest.json",
    interactionManifest: "interaction-manifest.json",
    learningProgress: "learning-progress.json",
    navigation: "navigation.json",
    searchIndex: "search-index.json",
  };
  for (const [key, name] of Object.entries(compatibilityNames)) {
    await writeFile(
      path.join(contentRoot, name),
      jsonSource(publicationValues[key]),
    );
  }
  await writeFile(
    path.join(contentRoot, "release.json"),
    jsonSource(release),
  );
  return release;
}

function runContentScript(script, parameters, environment = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "node",
      [script, ...parameters],
      {
        cwd: appRoot,
        env: {
          ...process.env,
          HANDBOOK_CONTENT_BUCKET: `publish-test-${process.pid}`,
          HANDBOOK_CONTENT_ROOT: contentRoot,
          HANDBOOK_PUBLISH_STATE_PATH: path.join(
            testRoot,
            "publish-state.json",
          ),
          HANDBOOK_R2_PERSIST_TO: path.join(testRoot, "r2"),
          ...environment,
        },
      },
    );
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("exit", (code) => {
      const output = Buffer.concat(stdout).toString("utf8");
      if (code === 0) {
        resolve(output);
        return;
      }
      reject(new Error(
        `${Buffer.concat(stderr).toString("utf8")}${output}`,
      ));
    });
  });
}

function runPublisher({
  now = 1_000,
  retainedReleases = 2,
} = {}) {
  return runContentScript(
    "scripts/publish-content.mjs",
    ["--local"],
    {
      HANDBOOK_CONTENT_RETAIN_RELEASES: String(retainedReleases),
      HANDBOOK_PUBLISH_NOW: String(now),
    },
  );
}

function runRollback() {
  return runContentScript(
    "scripts/rollback-content.mjs",
    ["previous", "--local"],
  );
}

await rm(testRoot, { force: true, recursive: true });
await mkdir(objectRoot, { recursive: true });

await writeRelease("第一版");
assert.match(await runPublisher({ now: 1_000 }), /7 个新对象/u);
assert.match(
  await runPublisher({ now: 2_000 }),
  /已经在线，无需上传/u,
);

const secondRelease = await writeRelease("第二版");
assert.match(await runPublisher({ now: 3_000 }), /4 个新对象/u);

await writeRelease("第三版");
const cleanupOutput = await runPublisher({ now: 4_000 });
assert.match(
  cleanupOutput,
  /已回收 4 个失效对象和 1 个过期版本快照/u,
);

const state = JSON.parse(await readFile(
  path.join(testRoot, "publish-state.json"),
  "utf8",
));
assert.equal(state.version, 2);
assert.equal(state.releases.length, 2);
assert.equal(state.releases[0].objectPaths.length, 7);

assert.match(await runRollback(), /正文已从 .* 回滚到/u);
const rollbackState = JSON.parse(await readFile(
  path.join(testRoot, "publish-state.json"),
  "utf8",
));
assert.equal(rollbackState.currentReleaseId, secondRelease.releaseId);

console.log(
  "R2 增量发布检查通过：相同版本跳过，正文更新只上传四个新对象，"
    + "只保留当前版与上一版，并可原子回滚。",
);
