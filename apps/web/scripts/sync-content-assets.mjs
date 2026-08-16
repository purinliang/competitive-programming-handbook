import { createHash } from "node:crypto";
import { access, copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const appRoot = process.cwd();
const source = path.resolve(appRoot, "../../notes/assets");
const target = path.resolve(appRoot, "public/content-assets");
const statePath = path.resolve(appRoot, ".content-cache/assets-state.json");
const arguments_ = new Set(process.argv.slice(2));
const unknownArguments = [...arguments_].filter(
  (argument) => argument !== "--full" && argument !== "--incremental",
);
if (unknownArguments.length > 0 || (arguments_.has("--full") && arguments_.has("--incremental"))) {
  throw new Error("用法：node scripts/sync-content-assets.mjs [--incremental|--full]");
}
const fullBuild = arguments_.has("--full");

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return;
  }
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(directory, prefix = "") {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(path.join(directory, entry.name), relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }
  return files;
}

if (fullBuild) {
  await rm(target, { force: true, recursive: true });
}
await mkdir(target, { recursive: true });

const previousState = fullBuild ? undefined : await readJson(statePath);
const nextFiles = {};
let copied = 0;
const sourceFiles = await collectFiles(source);
for (const relativePath of sourceFiles) {
  const sourcePath = path.join(source, relativePath);
  const targetPath = path.join(target, relativePath);
  const contents = await readFile(sourcePath);
  const hash = createHash("sha256").update(contents).digest("hex");
  nextFiles[relativePath] = hash;
  if (
    !fullBuild
    && previousState?.files?.[relativePath] === hash
    && await fileExists(targetPath)
  ) {
    continue;
  }
  await mkdir(path.dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);
  copied += 1;
}

for (const relativePath of Object.keys(previousState?.files ?? {})) {
  if (!(relativePath in nextFiles)) {
    await rm(path.join(target, relativePath), { force: true });
  }
}

await mkdir(path.dirname(statePath), { recursive: true });
await writeFile(statePath, `${JSON.stringify({ files: nextFiles, version: 1 })}\n`);
console.log(
  `内容资源（${fullBuild ? "全量" : "增量"}）：复制 ${copied} 个、复用 ${sourceFiles.length - copied} 个。`,
);
