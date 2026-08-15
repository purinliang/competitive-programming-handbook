"use client";

import { Lock, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";

export interface DiscussionTarget {
  id: string;
  kind: "article" | "section";
  revision: string;
  title: string;
}

interface DiscussionComment {
  authorName: string;
  body: string;
  createdAt: number;
  deleted: boolean;
  id: string;
}

interface DiscussionThread {
  comments: DiscussionComment[];
  id: string;
  mine: boolean;
  status: string;
  versionCurrent: boolean;
  visibility: "private" | "public";
}

interface AccountState {
  authConfigured: boolean;
  user: null | { name: string };
}

export function DiscussionPanel({
  documentKey,
  onClose,
  target,
}: {
  documentKey: string;
  onClose: () => void;
  target: DiscussionTarget;
}) {
  const [account, setAccount] = useState<AccountState>();
  const [anonymous, setAnonymous] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [privateVisible, setPrivateVisible] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<string>();
  const [threads, setThreads] = useState<DiscussionThread[]>([]);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      document_key: documentKey,
      target_id: target.id,
      target_kind: target.kind,
    });
    try {
      const response = await fetch(`/api/discussions?${query}`, {
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "讨论加载失败");
      setThreads(result.threads);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "讨论加载失败");
    } finally {
      setLoading(false);
    }
  }, [documentKey, target.id, target.kind]);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((response) => response.ok ? response.json() : undefined)
      .then((result) => {
        if (result) setAccount(result);
      })
      .catch(() => undefined);
    loadThreads();
  }, [loadThreads]);

  async function createThread() {
    if (!body.trim()) return;
    setError("");
    const response = await fetch("/api/discussions", {
      body: JSON.stringify({
        anonymous,
        body,
        documentKey,
        targetId: target.id,
        targetKind: target.kind,
        targetRevision: target.revision,
        visibility: privateVisible ? "private" : "public",
      }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "留言失败");
      return;
    }
    setBody("");
    await loadThreads();
  }

  async function reply(threadId: string) {
    if (!replyBody.trim()) return;
    const response = await fetch(`/api/discussions/${threadId}/comments`, {
      body: JSON.stringify({ anonymous, body: replyBody }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "回复失败");
      return;
    }
    setReplyBody("");
    setReplyingTo(undefined);
    await loadThreads();
  }

  return (
    <aside className="discussion-panel" aria-label={`${target.title}讨论`}>
      <header>
        <div>
          <span>{target.kind === "article" ? "全文讨论" : "分节讨论"}</span>
          <h2>{target.title}</h2>
        </div>
        <button aria-label="关闭讨论" className="icon-button" onClick={onClose} type="button">
          <X aria-hidden="true" size={18} />
        </button>
      </header>

      <div className="discussion-panel-body">
        {loading ? <p className="discussion-hint">正在加载讨论……</p> : null}
        {!loading && threads.length === 0 ? (
          <p className="discussion-hint">这里还没有讨论。</p>
        ) : null}
        {threads.map((thread) => (
          <article className="discussion-thread" key={thread.id}>
            <div className="discussion-thread-meta">
              <span>{thread.visibility === "private" ? <><Lock size={13} />仅自己与管理员</> : "公开讨论"}</span>
              {!thread.versionCurrent ? <span>针对旧版本</span> : null}
            </div>
            {thread.comments.map((comment) => (
              <div className="discussion-comment" key={comment.id}>
                <div><strong>{comment.authorName}</strong><time>{new Date(comment.createdAt).toLocaleString("zh-CN")}</time></div>
                <p>{comment.body}</p>
              </div>
            ))}
            {account?.user && thread.status !== "locked" ? (
              replyingTo === thread.id ? (
                <div className="discussion-reply-form">
                  <textarea
                    onChange={(event) => setReplyBody(event.target.value)}
                    placeholder="写下回复"
                    rows={3}
                    value={replyBody}
                  />
                  <div>
                    <button className="discussion-text-action" onClick={() => setReplyingTo(undefined)} type="button">取消</button>
                    <button className="discussion-primary-action" onClick={() => reply(thread.id)} type="button">回复</button>
                  </div>
                </div>
              ) : (
                <button className="discussion-text-action" onClick={() => setReplyingTo(thread.id)} type="button">回复</button>
              )
            ) : null}
          </article>
        ))}

        <section className="discussion-compose">
          <h3>发起讨论</h3>
          {!account?.authConfigured ? (
            <p className="discussion-hint">网站登录尚未启用。</p>
          ) : !account.user ? (
            <button
              className="discussion-primary-action"
              onClick={() => authClient.signIn.social({
                callbackURL: window.location.href,
                provider: "github",
              })}
              type="button"
            >
              登录后留言
            </button>
          ) : (
            <>
              <textarea
                maxLength={4000}
                onChange={(event) => setBody(event.target.value)}
                placeholder="写下看不懂的地方、补充或建议"
                rows={5}
                value={body}
              />
              <label>
                <input
                  checked={privateVisible}
                  onChange={(event) => setPrivateVisible(event.target.checked)}
                  type="checkbox"
                />
                仅自己和管理员可见
              </label>
              <label>
                <input
                  checked={anonymous}
                  onChange={(event) => setAnonymous(event.target.checked)}
                  type="checkbox"
                />
                公开时匿名显示
              </label>
              <button className="discussion-primary-action" disabled={!body.trim()} onClick={createThread} type="button">
                提交讨论
              </button>
            </>
          )}
          {error ? <p className="discussion-error">{error}</p> : null}
        </section>
      </div>
    </aside>
  );
}
