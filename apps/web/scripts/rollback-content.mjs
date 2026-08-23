import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const appRoot = process.cwd();
const bucketName = process.env.HANDBOOK_CONTENT_BUCKET
  ?? "handbook-content";
const statePath = process.env.HANDBOOK_PUBLISH_STATE_PATH
  ? path.resolve(process.env.HANDBOOK_PUBLISH_STATE_PATH)
  : path.join(appRoot, ".content-cache/r2-publish-state.json");
const releasePath = path.join(
  path.dirname(statePath),
  "r2-rollback-release.json",
);
const arguments_ = process.argv.slice(2);
const unknownArguments = arguments_.filter((argument) => (
  argument.startsWith("--")
  && argument !== "--local"
  && argument !== "--remote"
));
const local = arguments_.includes("--local");
const remote = arguments_.includes("--remote");
const identifiers = arguments_.filter((argument) => !argument.startsWith("--"));

if (unknownArguments.length > 0 || local && remote || identifiers.length > 1) {
  throw new Error(
    "用法：node scripts/rollback-content.mjs "
      + "[previous|release-id] [--local|--remote]",
  );
}

const targetFlag = local ? "--local" : "--remote";
const targetArguments = [targetFlag];
if (local && process.env.HANDBOOK_R2_PERSIST_TO) {
  targetArguments.push(
    "--persist-to",
    path.resolve(process.env.HANDBOOK_R2_PERSIST_TO),
  );
}

function runWrangler(parameters) {
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

async function getObject(key) {
  return await runWrangler([
    "r2",
    "object",
    "get",
    `${bucketName}/${key}`,
    ...targetArguments,
    "--pipe",
  ]);
}

async function putObject(key, filePath) {
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
    "public, max-age=60, must-revalidate",
  ]);
}

const state = JSON.parse(await getObject("publish-state.json"));
if (state.version !== 2 || !Array.isArray(state.releases)) {
  throw new Error("R2 发布状态不支持原子回滚");
}

const identifier = identifiers[0] ?? "previous";
const sortedReleases = [...state.releases].sort(
  (left, right) => right.publishedAt - left.publishedAt,
);
const target = identifier === "previous"
  ? sortedReleases.find(
    (release) => release.releaseId !== state.currentReleaseId,
  )
  : sortedReleases.find((release) => release.releaseId === identifier);
if (!target) {
  throw new Error("没有找到可以回滚的正文版本");
}
if (target.releaseId === state.currentReleaseId) {
  console.log(`正文版本 ${target.releaseId} 已经在线。`);
  process.exit(0);
}

const releaseSource = await getObject(target.releasePath);
const release = JSON.parse(releaseSource);
if (release.releaseId !== target.releaseId) {
  throw new Error("R2 版本快照与发布状态不一致");
}

await mkdir(path.dirname(statePath), { recursive: true });
await writeFile(releasePath, releaseSource);
await putObject("release.json", releasePath);

const nextState = {
  ...state,
  currentReleaseId: target.releaseId,
};
await writeFile(statePath, `${JSON.stringify(nextState)}\n`);
await putObject("publish-state.json", statePath);
console.log(
  `正文已从 ${state.currentReleaseId} 回滚到 ${target.releaseId}。`,
);
