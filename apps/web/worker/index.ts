import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { authIsConfigured, createAuth } from "./auth";
import { getDocument, getQuestion, getSection } from "./content-manifest";
import { requireSession } from "./session";

import type { WorkerBindings } from "./env";

type AppEnv = {
  Bindings: WorkerBindings;
  Variables: {
    user: {
      id: string;
      name: string;
    };
  };
};

const app = new Hono<AppEnv>();

function assertSameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new HTTPException(403, { message: "请求来源无效" });
  }
}

async function readObject(request: Request) {
  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (contentLength > 16 * 1024) {
    throw new HTTPException(413, { message: "请求内容过大" });
  }

  try {
    const value = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error();
    }
    return value as Record<string, unknown>;
  } catch {
    throw new HTTPException(400, { message: "请求格式无效" });
  }
}

app.get("/api/health", (c) => c.json({
  authConfigured: authIsConfigured(c.env),
  ok: true,
}));

app.all("/api/auth/*", async (c) => {
  if (!authIsConfigured(c.env)) {
    return c.json({ error: "登录尚未配置" }, 503);
  }
  const auth = createAuth(c.env, new URL(c.req.url).origin);
  return await auth.handler(c.req.raw);
});

app.get("/api/me", async (c) => {
  if (!authIsConfigured(c.env)) {
    return c.json({ authConfigured: false, user: null });
  }
  const auth = createAuth(c.env, new URL(c.req.url).origin);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ authConfigured: true, user: null });
  }
  const role = await c.env.DB.prepare(
    "SELECT role FROM user_roles WHERE userId = ?",
  ).bind(session.user.id).first<{ role: string }>();
  return c.json({
    authConfigured: true,
    user: {
      id: session.user.id,
      name: session.user.name,
      role: role?.role ?? "student",
    },
  });
});

app.get("/api/learning/state", requireSession, async (c) => {
  const documentKey = c.req.query("document_key") ?? "";
  const document = getDocument(documentKey);
  if (!document) {
    throw new HTTPException(404, { message: "文章不存在" });
  }

  const user = c.get("user");
  const [sections, attempts] = await Promise.all([
    c.env.DB.prepare(
      `SELECT sectionId, sectionRevision, readAt
       FROM section_progress
       WHERE userId = ? AND documentKey = ? AND documentEpoch = ?`,
    ).bind(user.id, documentKey, document.documentEpoch).all(),
    c.env.DB.prepare(
      `SELECT questionId, questionRevision, selectedOptionId, correct, createdAt
       FROM question_attempts
       WHERE userId = ? AND documentKey = ? AND documentEpoch = ?
       ORDER BY createdAt DESC`,
    ).bind(user.id, documentKey, document.documentEpoch).all(),
  ]);

  const currentAttempts = new Map<string, unknown>();
  for (const attempt of attempts.results) {
    const questionId = String(attempt.questionId);
    if (!currentAttempts.has(questionId)) {
      currentAttempts.set(questionId, attempt);
    }
  }

  return c.json({
    documentEpoch: document.documentEpoch,
    questions: [...currentAttempts.values()],
    sections: sections.results,
  });
});

app.post("/api/learning/sections", requireSession, async (c) => {
  assertSameOrigin(c.req.raw);
  const body = await readObject(c.req.raw);
  const documentKey = typeof body.documentKey === "string" ? body.documentKey : "";
  const sectionId = typeof body.sectionId === "string" ? body.sectionId : "";
  const sectionRevision = typeof body.sectionRevision === "string" ? body.sectionRevision : "";
  const read = body.read === true;
  const document = getDocument(documentKey);
  const section = getSection(documentKey, sectionId);
  if (!document || !section || section.revision !== sectionRevision) {
    throw new HTTPException(409, { message: "本节内容已经更新，请刷新页面" });
  }

  const user = c.get("user");
  if (!read) {
    await c.env.DB.prepare(
      `DELETE FROM section_progress
       WHERE userId = ? AND documentKey = ? AND documentEpoch = ? AND sectionId = ?`,
    ).bind(user.id, documentKey, document.documentEpoch, sectionId).run();
    return c.json({ read: false });
  }

  const now = Date.now();
  await c.env.DB.prepare(
    `INSERT INTO section_progress
       (userId, documentKey, documentEpoch, sectionId, sectionRevision, readAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (userId, documentKey, documentEpoch, sectionId)
     DO UPDATE SET sectionRevision = excluded.sectionRevision,
                   readAt = excluded.readAt,
                   updatedAt = excluded.updatedAt`,
  ).bind(
    user.id,
    documentKey,
    document.documentEpoch,
    sectionId,
    sectionRevision,
    now,
    now,
  ).run();
  return c.json({ read: true, readAt: now });
});

app.post("/api/learning/questions/attempts", requireSession, async (c) => {
  assertSameOrigin(c.req.raw);
  const body = await readObject(c.req.raw);
  const documentKey = typeof body.documentKey === "string" ? body.documentKey : "";
  const questionId = typeof body.questionId === "string" ? body.questionId : "";
  const questionRevision = typeof body.questionRevision === "string" ? body.questionRevision : "";
  const selectedOptionId = typeof body.selectedOptionId === "string" ? body.selectedOptionId : "";
  const document = getDocument(documentKey);
  const question = getQuestion(documentKey, questionId);
  if (!document || !question || question.revision !== questionRevision) {
    throw new HTTPException(409, { message: "题目已经更新，请刷新页面" });
  }
  if (!selectedOptionId || selectedOptionId.length > 32) {
    throw new HTTPException(400, { message: "选项无效" });
  }

  const id = crypto.randomUUID();
  const now = Date.now();
  const correct = selectedOptionId === question.correctOptionId;
  await c.env.DB.prepare(
    `INSERT INTO question_attempts
       (id, userId, documentKey, documentEpoch, questionId, questionRevision,
        selectedOptionId, correct, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id,
    c.get("user").id,
    documentKey,
    document.documentEpoch,
    questionId,
    questionRevision,
    selectedOptionId,
    correct ? 1 : 0,
    now,
  ).run();
  return c.json({ attemptId: id, correct, createdAt: now });
});

app.notFound((c) => c.json({ error: "API 不存在" }, 404));
app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }
  console.error(error);
  return c.json({ error: "服务器内部错误" }, 500);
});

export default app;
