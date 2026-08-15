import { HTTPException } from "hono/http-exception";

import type { Context } from "hono";
import type { AppEnv } from "./types";

export async function enforceRateLimit(
  c: Context<AppEnv>,
  scopeKey: string,
  action: string,
  limit: number,
  windowMilliseconds: number,
) {
  const now = Date.now();
  const windowStart = now - windowMilliseconds;
  const record = await c.env.DB.prepare(
    `INSERT INTO api_rate_limits (scopeKey, action, windowStart, count)
     VALUES (?, ?, ?, 1)
     ON CONFLICT (scopeKey, action) DO UPDATE SET
       windowStart = CASE
         WHEN api_rate_limits.windowStart < ? THEN excluded.windowStart
         ELSE api_rate_limits.windowStart
       END,
       count = CASE
         WHEN api_rate_limits.windowStart < ? THEN 1
         ELSE api_rate_limits.count + 1
       END
     RETURNING count`,
  ).bind(scopeKey, action, now, windowStart, windowStart).first<{ count: number }>();
  if ((record?.count ?? limit + 1) > limit) {
    throw new HTTPException(429, { message: "操作过于频繁，请稍后再试" });
  }
}

export async function verifyTurnstile(c: Context<AppEnv>, token: unknown) {
  if (!c.env.TURNSTILE_SECRET_KEY) return;
  if (typeof token !== "string" || !token) {
    throw new HTTPException(400, { message: "请先完成人机验证" });
  }
  const form = new FormData();
  form.set("secret", c.env.TURNSTILE_SECRET_KEY);
  form.set("response", token);
  const remoteIp = c.req.header("CF-Connecting-IP");
  if (remoteIp) form.set("remoteip", remoteIp);
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { body: form, method: "POST" },
  );
  const result = await response.json() as { success?: boolean };
  if (!result.success) {
    throw new HTTPException(400, { message: "人机验证失败，请重试" });
  }
}
