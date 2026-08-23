import { spawn } from "node:child_process";
import { watch } from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const notesRoot = path.resolve(appRoot, "../../notes");
const debounceMilliseconds = 250;
let building = false;
let debounceTimer;
let pending = false;

function run(command, parameters) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, parameters, {
      cwd: appRoot,
      env: process.env,
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(
          `正文增量编译失败（${signal ?? `退出码 ${code}`}）`,
        ));
      }
    });
  });
}

async function rebuild() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  try {
    console.log("\n检测到正文变化，开始增量编译……");
    await run(process.execPath, [
      "scripts/build-content.mjs",
      "--incremental",
    ]);
    await run(process.execPath, ["scripts/build-runtime-content.mjs"]);
    await run(process.execPath, [
      "scripts/sync-content-assets.mjs",
      "--incremental",
    ]);
    console.log("正文增量编译完成，浏览器将自动更新。\n");
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  } finally {
    building = false;
    if (pending) {
      pending = false;
      void rebuild();
    }
  }
}

function scheduleRebuild(relativePath) {
  if (!relativePath) return;
  const normalized = relativePath.replaceAll("\\", "/");
  if (
    !normalized.endsWith(".md")
    && !normalized.endsWith(".quiz.json")
    && !normalized.startsWith("assets/")
  ) {
    return;
  }
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => void rebuild(), debounceMilliseconds);
}

const watcher = watch(
  notesRoot,
  { recursive: true },
  (_eventType, filename) => scheduleRebuild(filename?.toString()),
);

watcher.on("error", (error) => {
  console.error(`正文监听失败：${error.message}`);
});

console.log("正在监听 Markdown、题目和正文资源变化。");
