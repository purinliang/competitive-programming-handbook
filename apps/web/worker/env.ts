import type { D1Database, Fetcher } from "@cloudflare/workers-types";

export interface WorkerBindings {
  ASSETS: Fetcher;
  DB: D1Database;
  BETTER_AUTH_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
}
