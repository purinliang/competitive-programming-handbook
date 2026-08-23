import { spawn } from "node:child_process";

const children = new Set();
let stopping = false;

function start(command, parameters) {
  const child = spawn(command, parameters, {
    env: process.env,
    stdio: "inherit",
  });
  children.add(child);
  child.once("exit", (code, signal) => {
    children.delete(child);
    if (!stopping) {
      stop(signal ? 1 : code ?? 1);
    }
  });
  return child;
}

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(code), 50).unref();
}

const nextArguments = process.argv.slice(2);
if (nextArguments[0] === "--") nextArguments.shift();

start("pnpm", ["exec", "next", "dev", ...nextArguments]);
start(process.execPath, ["scripts/watch-content.mjs"]);

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
