import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { authIsConfigured, createAuth } from "./auth";

import type { WorkerBindings } from "./env";

interface SessionVariables {
  user: {
    id: string;
    name: string;
  };
}

export const requireSession = createMiddleware<{
  Bindings: WorkerBindings;
  Variables: SessionVariables;
}>(async (c, next) => {
  if (!authIsConfigured(c.env)) {
    throw new HTTPException(503, { message: "登录尚未配置" });
  }

  const auth = createAuth(c.env, new URL(c.req.url).origin);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw new HTTPException(401, { message: "请先登录" });
  }

  c.set("user", { id: session.user.id, name: session.user.name });
  await next();
});
