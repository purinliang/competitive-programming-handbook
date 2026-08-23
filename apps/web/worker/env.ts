import type {
  D1Database,
} from "@cloudflare/workers-types";

interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

interface ContentObject {
  body: BodyInit | null;
  httpEtag: string;
  httpMetadata?: {
    contentType?: string;
  };
}

interface ContentBucket {
  get(key: string): Promise<ContentObject | null>;
}

export interface WorkerBindings {
  ASSETS: AssetFetcher;
  CONTENT?: ContentBucket;
  DB: D1Database;
  BETTER_AUTH_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
}
