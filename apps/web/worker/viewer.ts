import type { Context } from "hono";

import { authIsConfigured, createAuth } from "./auth";

import type { AppEnv, Viewer } from "./types";

export async function getOptionalViewer(c: Context<AppEnv>): Promise<Viewer | null> {
  if (!authIsConfigured(c.env)) {
    return null;
  }
  const auth = createAuth(c.env, new URL(c.req.url).origin);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return null;
  }
  const roleRecord = await c.env.DB.prepare(
    "SELECT role FROM user_roles WHERE userId = ?",
  ).bind(session.user.id).first<{ role: string }>();
  return {
    id: session.user.id,
    name: session.user.name,
    role: roleRecord?.role === "admin" ? "admin" : "student",
  };
}
