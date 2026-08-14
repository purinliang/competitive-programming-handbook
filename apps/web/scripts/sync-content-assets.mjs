import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const appRoot = process.cwd();
const source = path.resolve(appRoot, "../../notes/assets");
const target = path.resolve(appRoot, "public/content-assets");

await rm(target, { force: true, recursive: true });
await mkdir(path.dirname(target), { recursive: true });
await cp(source, target, { recursive: true });
