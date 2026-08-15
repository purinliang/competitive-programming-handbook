import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { getDocument, getSection, getSectionIds } from "./content-manifest";
import { assertSameOrigin, readObject, requiredString } from "./request";
import { enforceRateLimit, verifyTurnstile } from "./security";
import { requireSession } from "./session";
import { getOptionalViewer } from "./viewer";

import type { AppEnv, Viewer } from "./types";

interface ThreadRow {
  anonymous: number;
  createdAt: number;
  documentEpoch: number;
  id: string;
  quotedText: string | null;
  status: string;
  targetId: string;
  targetKind: "article" | "section";
  targetRevision: string;
  targetTitle: string;
  updatedAt: number;
  userId: string;
  userName: string;
  visibility: "private" | "public";
}

interface CommentRow {
  anonymous: number;
  body: string;
  createdAt: number;
  id: string;
  parentCommentId: string | null;
  status: string;
  updatedAt: number;
  userId: string;
  userName: string;
}

function visibleName(
  viewer: Viewer | null,
  userId: string,
  userName: string,
  anonymous: boolean,
) {
  if (viewer?.role === "admin" || viewer?.id === userId || !anonymous) {
    return userName;
  }
  return "匿名同学";
}

function validateTarget(
  documentKey: string,
  targetKind: string,
  targetId: string,
  targetRevision: string,
) {
  const document = getDocument(documentKey);
  if (!document) {
    throw new HTTPException(404, { message: "文章不存在" });
  }
  if (targetKind === "article") {
    if (targetId !== "article" || targetRevision !== document.contentRevision) {
      throw new HTTPException(409, { message: "文章已经更新，请刷新页面" });
    }
    return {
      canonicalTargetId: "article",
      document,
      quotedText: null,
      targetTitle: "全文",
    };
  }
  if (targetKind !== "section") {
    throw new HTTPException(400, { message: "讨论目标无效" });
  }
  const section = getSection(documentKey, targetId);
  if (!section || section.revision !== targetRevision) {
    throw new HTTPException(409, { message: "本节已经更新，请刷新页面" });
  }
  return {
    canonicalTargetId: section.id,
    document,
    quotedText: "quotedText" in section ? String(section.quotedText) : null,
    targetTitle: "title" in section ? String(section.title) : targetId,
  };
}

export const discussionRoutes = new Hono<AppEnv>();

discussionRoutes.get("/api/discussions", async (c) => {
  const documentKey = c.req.query("document_key") ?? "";
  const targetKind = c.req.query("target_kind") ?? "";
  const targetId = c.req.query("target_id") ?? "";
  const includeHistory = targetKind === "article"
    && targetId === "article"
    && c.req.query("include_history") === "1";
  const document = getDocument(documentKey);
  if (!document || !["article", "section"].includes(targetKind) || !targetId) {
    throw new HTTPException(400, { message: "讨论目标无效" });
  }

  const viewer = await getOptionalViewer(c);
  const isAdmin = viewer?.role === "admin" ? 1 : 0;
  const viewerId = viewer?.id ?? "";
  const targetIds = getSectionIds(documentKey, targetId);
  const targetPlaceholders = targetIds.map(() => "?").join(", ");
  const threadResult = includeHistory
    ? await c.env.DB.prepare(
      `SELECT t.*, u.name AS userName
       FROM discussion_threads t
       JOIN user u ON u.id = t.userId
       WHERE t.documentKey = ? AND t.status != 'deleted'
         AND (t.visibility = 'public' OR t.userId = ? OR ? = 1)
       ORDER BY t.createdAt ASC`,
    ).bind(documentKey, viewerId, isAdmin).all<ThreadRow>()
    : await c.env.DB.prepare(
      `SELECT t.*, u.name AS userName
       FROM discussion_threads t
       JOIN user u ON u.id = t.userId
       WHERE t.documentKey = ? AND t.documentEpoch = ? AND t.targetKind = ?
         AND t.targetId IN (${targetPlaceholders})
         AND t.status != 'deleted'
         AND (t.visibility = 'public' OR t.userId = ? OR ? = 1)
       ORDER BY t.createdAt ASC`,
    ).bind(
      documentKey,
      document.documentEpoch,
      targetKind,
      ...targetIds,
      viewerId,
      isAdmin,
    ).all<ThreadRow>();

  const threads = [];
  for (const thread of threadResult.results) {
    const currentSection = thread.targetKind === "section"
      ? getSection(documentKey, thread.targetId)
      : undefined;
    if (includeHistory && thread.targetKind === "section"
      && thread.documentEpoch === document?.documentEpoch && currentSection) {
      continue;
    }
    const commentResult = await c.env.DB.prepare(
      `SELECT c.*, u.name AS userName
       FROM discussion_comments c
       JOIN user u ON u.id = c.userId
       WHERE c.threadId = ?
       ORDER BY c.createdAt ASC`,
    ).bind(thread.id).all<CommentRow>();
    const comments = commentResult.results.flatMap((comment) => {
      if (comment.status === "hidden" && viewer?.role !== "admin") {
        return [];
      }
      const deleted = comment.status === "deleted";
      return [{
        anonymous: Boolean(comment.anonymous),
        authorName: visibleName(
          viewer,
          comment.userId,
          comment.userName,
          Boolean(comment.anonymous),
        ),
        body: deleted ? "此留言已删除" : comment.body,
        createdAt: comment.createdAt,
        deleted,
        id: comment.id,
        mine: viewer?.id === comment.userId,
        parentCommentId: comment.parentCommentId,
        updatedAt: comment.updatedAt,
      }];
    });
    const currentRevision = thread.targetKind === "article"
      ? document?.contentRevision
      : currentSection?.revision;
    threads.push({
      anonymous: Boolean(thread.anonymous),
      authorName: visibleName(
        viewer,
        thread.userId,
        thread.userName,
        Boolean(thread.anonymous),
      ),
      comments,
      createdAt: thread.createdAt,
      id: thread.id,
      mine: viewer?.id === thread.userId,
      status: thread.status,
      targetKind: thread.targetKind,
      targetRevision: thread.targetRevision,
      targetTitle: thread.targetTitle,
      quotedText: thread.quotedText,
      updatedAt: thread.updatedAt,
      versionCurrent: thread.documentEpoch === document?.documentEpoch
        && currentRevision === thread.targetRevision,
      visibility: thread.visibility,
    });
  }
  return c.json({ threads });
});

discussionRoutes.post("/api/discussions", requireSession, async (c) => {
  assertSameOrigin(c.req.raw);
  const body = await readObject(c.req.raw);
  await enforceRateLimit(c, c.get("user").id, "create-discussion", 10, 60_000);
  await verifyTurnstile(c, body.turnstileToken);
  const documentKey = requiredString(body, "documentKey", 240);
  const targetKind = requiredString(body, "targetKind", 16);
  const targetId = requiredString(body, "targetId", 96);
  const targetRevision = requiredString(body, "targetRevision", 32);
  const commentBody = requiredString(body, "body", 4000);
  const visibility = body.visibility === "public" ? "public" : "private";
  const anonymous = body.anonymous === true;
  const target = validateTarget(documentKey, targetKind, targetId, targetRevision);
  const user = c.get("user");
  const threadId = crypto.randomUUID();
  const commentId = crypto.randomUUID();
  const now = Date.now();

  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO discussion_threads
         (id, userId, documentKey, documentEpoch, targetKind, targetId,
          targetRevision, targetTitle, quotedText, visibility, anonymous,
          status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
    ).bind(
      threadId,
      user.id,
      documentKey,
      target.document.documentEpoch,
      targetKind,
      target.canonicalTargetId,
      targetRevision,
      target.targetTitle,
      target.quotedText,
      visibility,
      anonymous ? 1 : 0,
      now,
      now,
    ),
    c.env.DB.prepare(
      `INSERT INTO discussion_comments
         (id, threadId, userId, parentCommentId, body, anonymous,
          status, createdAt, updatedAt)
       VALUES (?, ?, ?, NULL, ?, ?, 'visible', ?, ?)`,
    ).bind(commentId, threadId, user.id, commentBody, anonymous ? 1 : 0, now, now),
  ]);

  return c.json({ commentId, threadId }, 201);
});

discussionRoutes.post("/api/discussions/:threadId/comments", requireSession, async (c) => {
  assertSameOrigin(c.req.raw);
  const body = await readObject(c.req.raw);
  await enforceRateLimit(c, c.get("user").id, "reply-discussion", 20, 60_000);
  const commentBody = requiredString(body, "body", 4000);
  const parentCommentId = typeof body.parentCommentId === "string"
    ? body.parentCommentId
    : null;
  const anonymous = body.anonymous === true;
  const user = c.get("user");
  const thread = await c.env.DB.prepare(
    `SELECT id, userId, visibility, status
     FROM discussion_threads WHERE id = ? AND status != 'deleted'`,
  ).bind(c.req.param("threadId")).first<{
    id: string;
    status: string;
    userId: string;
    visibility: string;
  }>();
  if (!thread) {
    throw new HTTPException(404, { message: "讨论不存在" });
  }
  if (thread.visibility === "private" && thread.userId !== user.id && user.role !== "admin") {
    throw new HTTPException(404, { message: "讨论不存在" });
  }
  if (thread.status === "locked" && user.role !== "admin") {
    throw new HTTPException(409, { message: "讨论已锁定" });
  }
  if (parentCommentId) {
    const parent = await c.env.DB.prepare(
      "SELECT id FROM discussion_comments WHERE id = ? AND threadId = ?",
    ).bind(parentCommentId, thread.id).first();
    if (!parent) {
      throw new HTTPException(400, { message: "回复目标无效" });
    }
  }

  const id = crypto.randomUUID();
  const now = Date.now();
  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO discussion_comments
         (id, threadId, userId, parentCommentId, body, anonymous,
          status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'visible', ?, ?)`,
    ).bind(
      id,
      thread.id,
      user.id,
      parentCommentId,
      commentBody,
      anonymous ? 1 : 0,
      now,
      now,
    ),
    c.env.DB.prepare(
      "UPDATE discussion_threads SET updatedAt = ? WHERE id = ?",
    ).bind(now, thread.id),
  ]);
  return c.json({ commentId: id }, 201);
});

discussionRoutes.patch("/api/discussions/:threadId", requireSession, async (c) => {
  assertSameOrigin(c.req.raw);
  await enforceRateLimit(c, c.get("user").id, "update-discussion", 20, 60_000);
  const body = await readObject(c.req.raw);
  const user = c.get("user");
  const thread = await c.env.DB.prepare(
    `SELECT userId, visibility, anonymous
     FROM discussion_threads WHERE id = ? AND status != 'deleted'`,
  ).bind(c.req.param("threadId")).first<{
    anonymous: number;
    userId: string;
    visibility: "private" | "public";
  }>();
  if (!thread || (thread.userId !== user.id && user.role !== "admin")) {
    throw new HTTPException(404, { message: "讨论不存在" });
  }
  if (body.visibility !== undefined
    && body.visibility !== "private" && body.visibility !== "public") {
    throw new HTTPException(400, { message: "可见范围无效" });
  }
  if (body.anonymous !== undefined && typeof body.anonymous !== "boolean") {
    throw new HTTPException(400, { message: "匿名设置无效" });
  }
  if (body.visibility === undefined && body.anonymous === undefined) {
    throw new HTTPException(400, { message: "没有需要更新的设置" });
  }
  const visibility = body.visibility ?? thread.visibility;
  const anonymous = body.anonymous ?? Boolean(thread.anonymous);
  const now = Date.now();
  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE discussion_threads
       SET visibility = ?, anonymous = ?, updatedAt = ?
       WHERE id = ?`,
    ).bind(visibility, anonymous ? 1 : 0, now, c.req.param("threadId")),
    c.env.DB.prepare(
      `UPDATE discussion_comments
       SET anonymous = ?, updatedAt = ?
       WHERE threadId = ? AND parentCommentId IS NULL`,
    ).bind(anonymous ? 1 : 0, now, c.req.param("threadId")),
  ]);
  return c.json({ anonymous, visibility });
});

discussionRoutes.post("/api/comments/:commentId/report", requireSession, async (c) => {
  assertSameOrigin(c.req.raw);
  await enforceRateLimit(c, c.get("user").id, "report-comment", 10, 3_600_000);
  const body = await readObject(c.req.raw);
  const reason = requiredString(body, "reason", 500);
  const user = c.get("user");
  const comment = await c.env.DB.prepare(
    `SELECT c.id
     FROM discussion_comments c
     JOIN discussion_threads t ON t.id = c.threadId
     WHERE c.id = ? AND c.status = 'visible' AND t.status != 'deleted'
       AND (t.visibility = 'public' OR t.userId = ? OR ? = 'admin')`,
  ).bind(c.req.param("commentId"), user.id, user.role).first();
  if (!comment) {
    throw new HTTPException(404, { message: "留言不存在" });
  }
  await c.env.DB.prepare(
    `INSERT INTO comment_reports
       (id, commentId, reporterUserId, reason, status, createdAt)
     VALUES (?, ?, ?, ?, 'open', ?)
     ON CONFLICT (commentId, reporterUserId)
     DO UPDATE SET reason = excluded.reason, status = 'open', createdAt = excluded.createdAt`,
  ).bind(
    crypto.randomUUID(),
    c.req.param("commentId"),
    c.get("user").id,
    reason,
    Date.now(),
  ).run();
  return c.json({ reported: true });
});
