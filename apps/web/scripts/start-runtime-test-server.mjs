import { spawn, spawnSync } from "node:child_process";

const migration = spawnSync(
  "pnpm",
  ["db:migrate:local"],
  { stdio: "inherit" },
);

if (migration.status !== 0) {
  process.exit(migration.status ?? 1);
}

const server = spawn(
  "pnpm",
  ["exec", "wrangler", "dev", "--port", "8793"],
  { stdio: "inherit" },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}

server.on("exit", (code) => process.exit(code ?? 0));
