"use client";

import { useCallback, useEffect, useState } from "react";

interface ThreadRecord {
  anonymous: number;
  authorEmail: string;
  authorName: string;
  commentCount: number;
  documentKey: string;
  id: string;
  openReportCount: number;
  status: "deleted" | "locked" | "open";
  targetTitle: string;
  updatedAt: number;
  visibility: "private" | "public";
}

interface ReportRecord {
  authorName: string;
  commentBody: string;
  commentId: string;
  createdAt: number;
  id: string;
  reason: string;
  reporterName: string;
  threadId: string;
}

interface ModerationData {
  events: ModerationEvent[];
  reports: ReportRecord[];
  threads: ThreadRecord[];
}

interface ModerationEvent {
  action: string;
  createdAt: number;
  id: string;
  moderatorName: string;
  reason: string | null;
  targetId: string;
  targetKind: "comment" | "report" | "thread";
}

export function ModerationDashboard() {
  const [data, setData] = useState<ModerationData>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/discussions", { credentials: "include" });
    const result = await response.json();
    if (!response.ok) {
      setError(response.status === 401 ? "请先使用管理员账号登录。" : result.error);
      return;
    }
    setData(result);
    setError("");
  }, []);

  useEffect(() => {
    load().catch(() => setError("审核数据加载失败。"));
  }, [load]);

  async function moderate(path: string, action: string) {
    setBusy(`${path}:${action}`);
    try {
      const response = await fetch(path, {
        body: JSON.stringify({ action }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "审核操作失败");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "审核操作失败");
    } finally {
      setBusy("");
    }
  }

  if (error) return <p className="moderation-message">{error}</p>;
  if (!data) return <p className="moderation-message">正在加载……</p>;
  return (
    <div className="moderation-dashboard">
      <section>
        <h2>待处理举报</h2>
        {data.reports.length === 0 ? <p>没有待处理举报。</p> : data.reports.map((report) => (
          <article key={report.id}>
            <div className="moderation-meta">
              <span>作者：{report.authorName}</span>
              <span>举报人：{report.reporterName}</span>
            </div>
            <blockquote>{report.commentBody}</blockquote>
            <p>举报理由：{report.reason}</p>
            <div className="moderation-actions">
              <button
                disabled={Boolean(busy)}
                onClick={() => moderate(
                  `/api/admin/comments/${report.commentId}/moderate`,
                  "hide",
                )}
                type="button"
              >隐藏留言</button>
              <button
                disabled={Boolean(busy)}
                onClick={() => moderate(
                  `/api/admin/reports/${report.id}/resolve`,
                  "dismiss",
                )}
                type="button"
              >驳回举报</button>
              <button
                disabled={Boolean(busy)}
                onClick={() => moderate(
                  `/api/admin/reports/${report.id}/resolve`,
                  "resolve",
                )}
                type="button"
              >标记已处理</button>
            </div>
          </article>
        ))}
      </section>

      <section>
        <h2>最近讨论</h2>
        {data.threads.length === 0 ? <p>还没有讨论。</p> : data.threads.map((thread) => (
          <article key={thread.id}>
            <div className="moderation-meta">
              <span>{thread.documentKey}</span>
              <span>{thread.targetTitle}</span>
              <span>{thread.visibility === "private" ? "私密" : "公开"}</span>
              <span>{thread.anonymous ? "对普通读者匿名" : "署名"}</span>
              <span>{thread.status}</span>
            </div>
            <h3>{thread.authorName}</h3>
            <p>{thread.authorEmail}</p>
            <p>{thread.commentCount} 条留言，{thread.openReportCount} 条待处理举报</p>
            <div className="moderation-actions">
              {thread.status === "deleted" ? (
                <button
                  disabled={Boolean(busy)}
                  onClick={() => moderate(
                    `/api/admin/threads/${thread.id}/moderate`,
                    "restore",
                  )}
                  type="button"
                >恢复</button>
              ) : (
                <>
                  <button
                    disabled={Boolean(busy)}
                    onClick={() => moderate(
                      `/api/admin/threads/${thread.id}/moderate`,
                      thread.status === "locked" ? "unlock" : "lock",
                    )}
                    type="button"
                  >{thread.status === "locked" ? "解除锁定" : "锁定"}</button>
                  <button
                    disabled={Boolean(busy)}
                    onClick={() => moderate(
                      `/api/admin/threads/${thread.id}/moderate`,
                      "delete",
                    )}
                    type="button"
                  >软删除</button>
                </>
              )}
            </div>
          </article>
        ))}
      </section>

      <section>
        <h2>审核记录</h2>
        {data.events.length === 0 ? <p>还没有审核操作。</p> : data.events.map((event) => (
          <article key={event.id}>
            <div className="moderation-meta">
              <span>{event.moderatorName}</span>
              <span>{new Date(event.createdAt).toLocaleString("zh-CN")}</span>
            </div>
            <p>
              {event.action} {event.targetKind}：{event.targetId}
            </p>
            {event.reason ? <p>原因：{event.reason}</p> : null}
          </article>
        ))}
      </section>
    </div>
  );
}
