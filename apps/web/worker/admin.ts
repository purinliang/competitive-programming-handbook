import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { assertSameOrigin, readObject, requiredString } from "./request";
import { requireSession } from "./session";

import type { AppEnv } from "./types";
import type { Context } from "hono";

const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  if (c.get("user").role !== "admin") {
    throw new HTTPException(404, { message: "页面不存在" });
  }
  await next();
});

function optionalReason(body: Record<string, unknown>) {
  if (body.reason === undefined || body.reason === null || body.reason === "") {
    return null;
  }
  return requiredString(body, "reason", 500);
}

function moderationEvent(
  c: Context<AppEnv>,
  targetKind: "comment" | "report" | "thread",
  targetId: string,
  action: string,
  reason: string | null,
) {
  return c.env.DB.prepare(
    `INSERT INTO moderation_events
       (id, moderatorUserId, targetKind, targetId, action, reason, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    crypto.randomUUID(),
    c.get("user").id,
    targetKind,
    targetId,
    action,
    reason,
    Date.now(),
  );
}

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.use("/api/admin/*", requireSession, requireAdmin);

adminRoutes.get("/api/admin/discussions", async (c) => {
  const threadResult = await c.env.DB.prepare(
    `SELECT t.*, u.name AS authorName, u.email AS authorEmail,
            COUNT(DISTINCT c.id) AS commentCount,
            COUNT(DISTINCT CASE WHEN r.status = 'open' THEN r.id END) AS openReportCount
     FROM discussion_threads t
     JOIN user u ON u.id = t.userId
     LEFT JOIN discussion_comments c ON c.threadId = t.id
     LEFT JOIN comment_reports r ON r.commentId = c.id
     GROUP BY t.id
     ORDER BY t.updatedAt DESC
     LIMIT 100`,
  ).all();
  const reportResult = await c.env.DB.prepare(
    `SELECT r.id, r.commentId, r.reason, r.status, r.createdAt,
            reporter.name AS reporterName, c.body AS commentBody,
            c.threadId, author.name AS authorName
     FROM comment_reports r
     JOIN user reporter ON reporter.id = r.reporterUserId
     JOIN discussion_comments c ON c.id = r.commentId
     JOIN user author ON author.id = c.userId
     WHERE r.status = 'open'
     ORDER BY r.createdAt DESC
     LIMIT 100`,
  ).all();
  return c.json({ reports: reportResult.results, threads: threadResult.results });
});

adminRoutes.post("/api/admin/threads/:threadId/moderate", async (c) => {
  assertSameOrigin(c.req.raw);
  const body = await readObject(c.req.raw);
  const action = requiredString(body, "action", 16);
  const reason = optionalReason(body);
  const state = {
    delete: { deletedAt: Date.now(), status: "deleted" },
    lock: { deletedAt: null, status: "locked" },
    restore: { deletedAt: null, status: "open" },
    unlock: { deletedAt: null, status: "open" },
  }[action];
  if (!state) {
    throw new HTTPException(400, { message: "审核动作无效" });
  }
  const threadId = c.req.param("threadId");
  const thread = await c.env.DB.prepare(
    "SELECT id FROM discussion_threads WHERE id = ?",
  ).bind(threadId).first();
  if (!thread) throw new HTTPException(404, { message: "讨论不存在" });
  await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE discussion_threads SET status = ?, deletedAt = ?, updatedAt = ? WHERE id = ?",
    ).bind(state.status, state.deletedAt, Date.now(), threadId),
    moderationEvent(c, "thread", threadId, action, reason),
  ]);
  return c.json({ status: state.status });
});

adminRoutes.post("/api/admin/comments/:commentId/moderate", async (c) => {
  assertSameOrigin(c.req.raw);
  const body = await readObject(c.req.raw);
  const action = requiredString(body, "action", 16);
  const reason = optionalReason(body);
  const state = {
    delete: { deletedAt: Date.now(), status: "deleted" },
    hide: { deletedAt: null, status: "hidden" },
    restore: { deletedAt: null, status: "visible" },
  }[action];
  if (!state) throw new HTTPException(400, { message: "审核动作无效" });
  const commentId = c.req.param("commentId");
  const comment = await c.env.DB.prepare(
    "SELECT id, threadId FROM discussion_comments WHERE id = ?",
  ).bind(commentId).first<{ id: string; threadId: string }>();
  if (!comment) throw new HTTPException(404, { message: "留言不存在" });
  const now = Date.now();
  await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE discussion_comments SET status = ?, deletedAt = ?, updatedAt = ? WHERE id = ?",
    ).bind(state.status, state.deletedAt, now, commentId),
    c.env.DB.prepare(
      "UPDATE discussion_threads SET updatedAt = ? WHERE id = ?",
    ).bind(now, comment.threadId),
    moderationEvent(c, "comment", commentId, action, reason),
  ]);
  return c.json({ status: state.status });
});

adminRoutes.post("/api/admin/reports/:reportId/resolve", async (c) => {
  assertSameOrigin(c.req.raw);
  const body = await readObject(c.req.raw);
  const action = requiredString(body, "action", 16);
  const reason = optionalReason(body);
  const status = action === "resolve" ? "resolved"
    : action === "dismiss" ? "dismissed"
      : undefined;
  if (!status) throw new HTTPException(400, { message: "审核动作无效" });
  const reportId = c.req.param("reportId");
  const report = await c.env.DB.prepare(
    "SELECT id FROM comment_reports WHERE id = ?",
  ).bind(reportId).first();
  if (!report) throw new HTTPException(404, { message: "举报不存在" });
  const now = Date.now();
  await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE comment_reports SET status = ?, resolvedAt = ? WHERE id = ?",
    ).bind(status, now, reportId),
    moderationEvent(c, "report", reportId, action, reason),
  ]);
  return c.json({ status });
});
