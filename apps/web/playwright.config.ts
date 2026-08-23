import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:8793",
    viewport: { height: 900, width: 1440 },
  },
  webServer: {
    command: "node scripts/start-runtime-test-server.mjs",
    reuseExistingServer: false,
    timeout: 30_000,
    url: "http://127.0.0.1:8793/api/health",
  },
});
