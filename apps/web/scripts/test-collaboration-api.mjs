import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";

const baseUrl = process.env.COLLABORATION_TEST_URL ?? "http://127.0.0.1:8790";
const secret = "test-secret-for-local-only-1234567890";
const documentKey = "learning-path:cpp/a-plus-b-problem";
const manifest = JSON.parse(await readFile(
  new URL("../.content-cache/interaction-manifest.json", import.meta.url),
  "utf8",
));
const document = manifest.documents[documentKey];
assert(document, `${documentKey} 不在交互清单中`);
const contentRevision = document.contentRevision;
const sectionId = document.sections[0].id;
const sectionRevision = document.sections[0].revision;

function cookie(token) {
  const signature = createHmac("sha256", secret).update(token).digest("base64");
  return `better-auth.session_token=${encodeURIComponent(`${token}.${signature}`)}`;
}

const users = {
  admin: cookie("admin-token"),
  other: cookie("other-token"),
  student: cookie("student-token"),
};

async function request(path, {
  body,
  method = "GET",
  origin = true,
  user,
} = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (origin && method !== "GET") headers.Origin = baseUrl;
  if (user) headers.Cookie = users[user];
  const response = await fetch(`${baseUrl}${path}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers,
    method,
  });
  const result = await response.json();
  return { response, result };
}

const studentAccount = await request("/api/me", { user: "student" });
assert.equal(studentAccount.result.user.role, "student");
const adminAccount = await request("/api/me", { user: "admin" });
assert.equal(adminAccount.result.user.role, "admin");

const created = await request("/api/discussions", {
  body: {
    anonymous: false,
    body: "**私密问题**：为什么 $a+b$？",
    documentKey,
    targetId: "article",
    targetKind: "article",
    targetRevision: contentRevision,
    visibility: "private",
  },
  method: "POST",
  user: "student",
});
assert.equal(created.response.status, 201);
const { commentId, threadId } = created.result;

const publicPrivateView = await request(
  `/api/discussions?document_key=${encodeURIComponent(documentKey)}`
    + "&target_kind=article&target_id=article",
);
assert.deepEqual(publicPrivateView.result.threads, []);
const otherPrivateView = await request(
  `/api/discussions?document_key=${encodeURIComponent(documentKey)}`
    + "&target_kind=article&target_id=article",
  { user: "other" },
);
assert.deepEqual(otherPrivateView.result.threads, []);

const guessedReport = await request(`/api/comments/${commentId}/report`, {
  body: { reason: "猜测私密评论 ID" },
  method: "POST",
  user: "other",
});
assert.equal(guessedReport.response.status, 404);

const forbiddenAdmin = await request("/api/admin/discussions", { user: "student" });
assert.equal(forbiddenAdmin.response.status, 404);
const adminView = await request("/api/admin/discussions", { user: "admin" });
assert.equal(adminView.response.status, 200);
assert.equal(adminView.result.threads[0].authorEmail, "student@example.com");

const madeAnonymous = await request(`/api/discussions/${threadId}`, {
  body: { anonymous: true, visibility: "public" },
  method: "PATCH",
  user: "student",
});
assert.equal(madeAnonymous.response.status, 200);
const anonymousView = await request(
  `/api/discussions?document_key=${encodeURIComponent(documentKey)}`
    + "&target_kind=article&target_id=article",
);
const serializedAnonymousView = JSON.stringify(anonymousView.result);
assert.equal(anonymousView.result.threads[0].authorName, "匿名同学");
assert.equal(anonymousView.result.threads[0].comments[0].authorName, "匿名同学");
assert.equal(serializedAnonymousView.includes("student-user"), false);
assert.equal(serializedAnonymousView.includes("Student User"), false);
assert.equal(serializedAnonymousView.includes("student@example.com"), false);

const missingOrigin = await request("/api/learning/sections", {
  body: { documentKey, read: true, sectionId, sectionRevision },
  method: "POST",
  origin: false,
  user: "student",
});
assert.equal(missingOrigin.response.status, 403);
const staleSection = await request("/api/learning/sections", {
  body: { documentKey, read: true, sectionId, sectionRevision: "stale" },
  method: "POST",
  user: "student",
});
assert.equal(staleSection.response.status, 409);
const currentSection = await request("/api/learning/sections", {
  body: { documentKey, read: true, sectionId, sectionRevision },
  method: "POST",
  user: "student",
});
assert.equal(currentSection.response.status, 200);

const locked = await request(`/api/admin/threads/${threadId}/moderate`, {
  body: { action: "lock", reason: "自动化测试" },
  method: "POST",
  user: "admin",
});
assert.equal(locked.result.status, "locked");
const lockedReply = await request(`/api/discussions/${threadId}/comments`, {
  body: { body: "锁定后的回复" },
  method: "POST",
  user: "student",
});
assert.equal(lockedReply.response.status, 409);

const oversized = await request("/api/learning/sections", {
  body: { padding: "x".repeat(17_000) },
  method: "POST",
  user: "student",
});
assert.equal(oversized.response.status, 413);

await request(`/api/admin/threads/${threadId}/moderate`, {
  body: { action: "delete" },
  method: "POST",
  user: "admin",
});
const deletedView = await request(
  `/api/discussions?document_key=${encodeURIComponent(documentKey)}`
    + "&target_kind=article&target_id=article",
);
assert.deepEqual(deletedView.result.threads, []);

console.log("协作学习 API 集成测试通过。");
