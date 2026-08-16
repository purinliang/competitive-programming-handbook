import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { adminRoutes } from "./admin";
import { authIsConfigured, createAuth } from "./auth";
import {
  getDocument,
  getDocuments,
  getQuestion,
  getSection,
  getSectionIds,
} from "./content-manifest";
import { discussionRoutes } from "./discussions";
import { assertSameOrigin, readObject } from "./request";
import { enforceRateLimit } from "./security";
import { requireSession } from "./session";

import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

interface SectionProgressRow {
  readAt: number;
  sectionId: string;
  sectionRevision: string;
  updatedAt: number;
}

interface LearningProgressRow {
  correct: number;
  createdAt: number;
  documentEpoch: number;
  documentKey: string;
  questionId: string;
  questionRevision: string;
}

app.get("/api/health", (c) => c.json({
  authConfigured: authIsConfigured(c.env),
  ok: true,
}));

app.get("/api/config", (c) => c.json({
  turnstileSiteKey: c.env.TURNSTILE_SITE_KEY ?? null,
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
      email: session.user.email,
      id: session.user.id,
      image: session.user.image,
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
      `SELECT sectionId, sectionRevision, readAt, updatedAt
       FROM section_progress
       WHERE userId = ? AND documentKey = ? AND documentEpoch = ?`,
    ).bind(user.id, documentKey, document.documentEpoch).all<SectionProgressRow>(),
    c.env.DB.prepare(
      `SELECT questionId, questionRevision, selectedOptionId, correct, createdAt
       FROM question_attempts
       WHERE userId = ? AND documentKey = ? AND documentEpoch = ?
       ORDER BY createdAt DESC, rowid DESC`,
    ).bind(user.id, documentKey, document.documentEpoch).all(),
  ]);

  const currentAttempts = new Map<string, unknown>();
  for (const attempt of attempts.results) {
    const questionId = String(attempt.questionId);
    if (!currentAttempts.has(questionId)) {
      currentAttempts.set(questionId, attempt);
    }
  }

  const currentSections = new Map<string, SectionProgressRow>();
  for (const record of sections.results) {
    const section = getSection(documentKey, record.sectionId);
    if (!section) continue;
    const current = currentSections.get(section.id);
    if (!current || record.updatedAt > current.updatedAt) {
      currentSections.set(section.id, { ...record, sectionId: section.id });
    }
  }

  return c.json({
    documentEpoch: document.documentEpoch,
    questions: [...currentAttempts.values()],
    sections: [...currentSections.values()],
  });
});

app.get("/api/learning/progress", requireSession, async (c) => {
  const attempts = await c.env.DB.prepare(
    `WITH latest AS (
       SELECT documentKey, documentEpoch, questionId, questionRevision,
              correct, createdAt,
              ROW_NUMBER() OVER (
                PARTITION BY documentKey, documentEpoch, questionId, questionRevision
                ORDER BY createdAt DESC, rowid DESC
              ) AS position
       FROM question_attempts
       WHERE userId = ? AND documentKey LIKE 'learning-path:%'
     )
     SELECT documentKey, documentEpoch, questionId, questionRevision,
            correct, createdAt
     FROM latest
     WHERE position = 1`,
  ).bind(c.get("user").id).all<LearningProgressRow>();

  const documents = getDocuments();
  const progress = new Map<string, {
    documentEpoch: number;
    documentKey: string;
    questions: Array<{
      correct: boolean;
      createdAt: number;
      questionId: string;
      questionRevision: string;
    }>;
  }>();
  for (const attempt of attempts.results) {
    const document = documents[attempt.documentKey];
    if (!document || document.documentEpoch !== attempt.documentEpoch) continue;
    const question = document.questions?.find((item) => item.id === attempt.questionId);
    if (!question || question.revision !== attempt.questionRevision) continue;
    const record = progress.get(attempt.documentKey) ?? {
      documentEpoch: document.documentEpoch,
      documentKey: attempt.documentKey,
      questions: [],
    };
    record.questions.push({
      correct: Boolean(attempt.correct),
      createdAt: attempt.createdAt,
      questionId: attempt.questionId,
      questionRevision: attempt.questionRevision,
    });
    progress.set(attempt.documentKey, record);
  }

  return c.json({ articles: [...progress.values()] });
});

app.post("/api/learning/sections", requireSession, async (c) => {
  assertSameOrigin(c.req.raw);
  await enforceRateLimit(c, c.get("user").id, "section-progress", 120, 60_000);
  const body = await readObject(c.req.raw);
  const documentKey = typeof body.documentKey === "string" ? body.documentKey : "";
  const sectionId = typeof body.sectionId === "string" ? body.sectionId : "";
  const sectionRevision = typeof body.sectionRevision === "string" ? body.sectionRevision : "";
  if (typeof body.read !== "boolean") {
    throw new HTTPException(400, { message: "已阅状态无效" });
  }
  const read = body.read;
  const document = getDocument(documentKey);
  const section = getSection(documentKey, sectionId);
  if (!document || !section || section.revision !== sectionRevision) {
    throw new HTTPException(409, { message: "本节内容已经更新，请刷新页面" });
  }

  const user = c.get("user");
  const sectionIds = getSectionIds(documentKey, section.id);
  const placeholders = sectionIds.map(() => "?").join(", ");
  const now = Date.now();
  const archiveProgress = c.env.DB.prepare(
    `INSERT INTO section_progress_history
       (id, userId, documentKey, documentEpoch, sectionId,
        sectionRevision, readAt, updatedAt, archivedAt)
     SELECT lower(hex(randomblob(16))), userId, documentKey, documentEpoch,
            sectionId, sectionRevision, readAt, updatedAt, ?
     FROM section_progress
     WHERE userId = ? AND documentKey = ? AND documentEpoch = ?
       AND sectionId IN (${placeholders})`,
  ).bind(
    now,
    user.id,
    documentKey,
    document.documentEpoch,
    ...sectionIds,
  );
  const deleteProgress = c.env.DB.prepare(
    `DELETE FROM section_progress
     WHERE userId = ? AND documentKey = ? AND documentEpoch = ?
       AND sectionId IN (${placeholders})`,
  ).bind(user.id, documentKey, document.documentEpoch, ...sectionIds);
  if (!read) {
    await c.env.DB.batch([archiveProgress, deleteProgress]);
    return c.json({ read: false });
  }

  await c.env.DB.batch([
    archiveProgress,
    deleteProgress,
    c.env.DB.prepare(
      `INSERT INTO section_progress
         (userId, documentKey, documentEpoch, sectionId, sectionRevision, readAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      user.id,
      documentKey,
      document.documentEpoch,
      section.id,
      sectionRevision,
      now,
      now,
    ),
  ]);
  return c.json({ read: true, readAt: now, sectionId: section.id });
});

app.post("/api/learning/questions/attempts", requireSession, async (c) => {
  assertSameOrigin(c.req.raw);
  await enforceRateLimit(c, c.get("user").id, "question-attempt", 60, 60_000);
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
  if (!question.optionIds.includes(selectedOptionId)) {
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

app.route("/", discussionRoutes);
app.route("/", adminRoutes);

app.notFound((c) => c.json({ error: "API 不存在" }, 404));
app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }
  console.error(error);
  return c.json({ error: "服务器内部错误" }, 500);
});

export default app;
