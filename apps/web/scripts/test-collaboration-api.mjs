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
const legacySectionId = document.sections[0].legacyIds[0];
const sectionRevision = document.sections[0].revision;
assert(legacySectionId, `${documentKey} 没有可用于兼容测试的旧小节身份`);
const question = document.questions[0];
assert(question, `${documentKey} 没有可用于测试的题目`);

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

const publicArticleResponse = await fetch(
  `${baseUrl}/learning-path/cpp/a-plus-b-problem/`,
);
assert.equal(publicArticleResponse.status, 200);
assert.match(
  publicArticleResponse.headers.get("content-type") ?? "",
  /text\/html/,
);
assert.match(await publicArticleResponse.text(), /A\s*\+\s*B Problem/i);

const studentAccount = await request("/api/me", { user: "student" });
assert.equal(studentAccount.result.user.role, "student");
const adminAccount = await request("/api/me", { user: "admin" });
assert.equal(adminAccount.result.user.role, "admin");

const currentArticleView = await request(
  `/api/discussions?document_key=${encodeURIComponent(documentKey)}`
    + "&target_kind=article&target_id=article",
);
assert.deepEqual(currentArticleView.result.threads, []);
const articleHistoryView = await request(
  `/api/discussions?document_key=${encodeURIComponent(documentKey)}`
    + "&target_kind=article&target_id=article&include_history=1",
);
const orphanThread = articleHistoryView.result.threads.find(
  (thread) => thread.id === "orphan-thread",
);
const oldEpochThread = articleHistoryView.result.threads.find(
  (thread) => thread.id === "old-epoch-thread",
);
assert.equal(orphanThread.targetTitle, "已经删除的小节");
assert.equal(orphanThread.versionCurrent, false);
assert.equal(oldEpochThread.targetKind, "article");
assert.equal(oldEpochThread.versionCurrent, false);

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
const guessedReply = await request(`/api/discussions/${threadId}/comments`, {
  body: { body: "猜测私密讨论 ID" },
  method: "POST",
  user: "other",
});
assert.equal(guessedReply.response.status, 404);

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
const emptyThreadUpdate = await request(`/api/discussions/${threadId}`, {
  body: {},
  method: "PATCH",
  user: "student",
});
assert.equal(emptyThreadUpdate.response.status, 400);
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

const forbiddenThreadUpdate = await request(`/api/discussions/${threadId}`, {
  body: { anonymous: false, visibility: "private" },
  method: "PATCH",
  user: "other",
});
assert.equal(forbiddenThreadUpdate.response.status, 404);

const anonymousReply = await request(`/api/discussions/${threadId}/comments`, {
  body: { anonymous: true, body: "匿名回复" },
  method: "POST",
  user: "other",
});
assert.equal(anonymousReply.response.status, 201);
const repliedView = await request(
  `/api/discussions?document_key=${encodeURIComponent(documentKey)}`
    + "&target_kind=article&target_id=article",
);
const serializedRepliedView = JSON.stringify(repliedView.result);
assert.equal(repliedView.result.threads[0].comments[1].authorName, "匿名同学");
assert.equal(serializedRepliedView.includes("other-user"), false);
assert.equal(serializedRepliedView.includes("Other Student"), false);
assert.equal(serializedRepliedView.includes("other@example.com"), false);

const reported = await request(`/api/comments/${commentId}/report`, {
  body: { reason: "自动化测试举报" },
  method: "POST",
  user: "other",
});
assert.equal(reported.response.status, 200);
const reportedAdminView = await request("/api/admin/discussions", { user: "admin" });
assert.equal(reportedAdminView.result.reports[0].commentId, commentId);
assert.equal(reportedAdminView.result.reports[0].reason, "自动化测试举报");
const reportId = reportedAdminView.result.reports[0].id;

const hiddenComment = await request(
  `/api/admin/comments/${anonymousReply.result.commentId}/moderate`,
  {
    body: { action: "hide", reason: "自动化测试" },
    method: "POST",
    user: "admin",
  },
);
assert.equal(hiddenComment.result.status, "hidden");
const hiddenPublicView = await request(
  `/api/discussions?document_key=${encodeURIComponent(documentKey)}`
    + "&target_kind=article&target_id=article",
);
assert.equal(hiddenPublicView.result.threads[0].comments.length, 1);
const hiddenAdminView = await request(
  `/api/discussions?document_key=${encodeURIComponent(documentKey)}`
    + "&target_kind=article&target_id=article",
  { user: "admin" },
);
assert.equal(hiddenAdminView.result.threads[0].comments.length, 2);
const restoredComment = await request(
  `/api/admin/comments/${anonymousReply.result.commentId}/moderate`,
  {
    body: { action: "restore" },
    method: "POST",
    user: "admin",
  },
);
assert.equal(restoredComment.result.status, "visible");

const resolvedReport = await request(`/api/admin/reports/${reportId}/resolve`, {
  body: { action: "resolve", reason: "自动化测试" },
  method: "POST",
  user: "admin",
});
assert.equal(resolvedReport.result.status, "resolved");
const resolvedAdminView = await request("/api/admin/discussions", { user: "admin" });
assert.deepEqual(resolvedAdminView.result.reports, []);

for (let attempt = 0; attempt < 8; attempt += 1) {
  const repeatedReport = await request(`/api/comments/${commentId}/report`, {
    body: { reason: `限流测试 ${attempt + 1}` },
    method: "POST",
    user: "other",
  });
  assert.equal(repeatedReport.response.status, 200);
}
const rateLimitedReport = await request(`/api/comments/${commentId}/report`, {
  body: { reason: "超过限流" },
  method: "POST",
  user: "other",
});
assert.equal(rateLimitedReport.response.status, 429);

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

const legacySection = await request("/api/learning/sections", {
  body: {
    documentKey,
    read: true,
    sectionId: legacySectionId,
    sectionRevision,
  },
  method: "POST",
  user: "student",
});
assert.equal(legacySection.response.status, 200);
assert.equal(legacySection.result.sectionId, sectionId);
const canonicalState = await request(
  `/api/learning/state?document_key=${encodeURIComponent(documentKey)}`,
  { user: "student" },
);
assert.equal(canonicalState.result.sections[0].sectionId, sectionId);

const staleQuestion = await request("/api/learning/questions/attempts", {
  body: {
    documentKey,
    questionId: question.id,
    questionRevision: "stale",
    selectedOptionId: question.optionIds[0],
  },
  method: "POST",
  user: "student",
});
assert.equal(staleQuestion.response.status, 409);
const forgedOption = await request("/api/learning/questions/attempts", {
  body: {
    documentKey,
    questionId: question.id,
    questionRevision: question.revision,
    selectedOptionId: "forged-option",
  },
  method: "POST",
  user: "student",
});
assert.equal(forgedOption.response.status, 400);
const currentQuestion = await request("/api/learning/questions/attempts", {
  body: {
    documentKey,
    questionId: question.id,
    questionRevision: question.revision,
    selectedOptionId: question.correctOptionId,
  },
  method: "POST",
  user: "student",
});
assert.equal(currentQuestion.response.status, 200);
assert.equal(currentQuestion.result.correct, true);

const locked = await request(`/api/admin/threads/${threadId}/moderate`, {
  body: { action: "lock", reason: "自动化测试" },
  method: "POST",
  user: "admin",
});
assert.equal(locked.result.status, "locked");
const auditView = await request("/api/admin/discussions", { user: "admin" });
assert.equal(auditView.result.events[0].action, "lock");
assert.equal(auditView.result.events[0].targetId, threadId);
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
