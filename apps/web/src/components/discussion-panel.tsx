"use client";

import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { authClient } from "@/lib/auth-client";
import { getAccountState } from "@/lib/collaboration-client";

import { Button, IconButton } from "./button";
import { DiscussionMarkdown } from "./discussion-markdown";
import { CheckboxField, TextAreaField } from "./form-controls";
import { StateMessage } from "./state-message";
import { TurnstileWidget } from "./turnstile-widget";

import type { AccountState } from "@/lib/collaboration-client";

const DISCUSSION_LOAD_ERROR = "评论暂时无法加载";
const DISCUSSION_ERROR_CACHE_MS = 30_000;
const DISCUSSION_LOADING_MINIMUM_MS = 300;

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
  mine: boolean;
}

interface DiscussionThread {
  comments: DiscussionComment[];
  id: string;
  mine: boolean;
  quotedText: string | null;
  status: string;
  targetKind: "article" | "section";
  targetTitle: string;
  versionCurrent: boolean;
  visibility: "private" | "public";
}

const discussionCache = new Map<string, DiscussionThread[]>();
const discussionErrorCache = new Map<string, number>();
const discussionRequests = new Map<string, Promise<DiscussionThread[]>>();

function hasFreshDiscussionError(cacheKey: string) {
  const expiresAt = discussionErrorCache.get(cacheKey) ?? 0;
  if (expiresAt > Date.now()) return true;
  discussionErrorCache.delete(cacheKey);
  return false;
}

async function readApiJson<T>(response: Response, fallbackMessage: string) {
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(fallbackMessage);
  }
  const result = await response.json() as T & { error?: string };
  if (!response.ok) {
    throw new Error(result.error ?? fallbackMessage);
  }
  return result;
}

export function DiscussionPanel({
  documentKey,
  inline = false,
  onClose = () => undefined,
  target,
}: {
  documentKey: string;
  inline?: boolean;
  onClose?: () => void;
  target: DiscussionTarget;
}) {
  const cacheKey = [
    documentKey,
    target.kind,
    target.id,
    target.revision,
    target.kind === "article" ? "history" : "current",
  ].join(":");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const hasDraftRef = useRef(false);
  const titleId = useId();
  const headingId = inline ? "article-comments" : titleId;
  const [account, setAccount] = useState<AccountState>();
  const [actionError, setActionError] = useState("");
  const [body, setBody] = useState("");
  const [loadError, setLoadError] = useState(
    () => hasFreshDiscussionError(cacheKey) ? DISCUSSION_LOAD_ERROR : "",
  );
  const [loading, setLoading] = useState(
    () => !discussionCache.has(cacheKey) && !hasFreshDiscussionError(cacheKey),
  );
  const [privateVisible, setPrivateVisible] = useState(true);
  const [reportBody, setReportBody] = useState("");
  const [reportingComment, setReportingComment] = useState<string>();
  const [statusMessage, setStatusMessage] = useState("");
  const [threads, setThreads] = useState<DiscussionThread[]>(
    () => discussionCache.get(cacheKey) ?? [],
  );
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string>();
  const [turnstileToken, setTurnstileToken] = useState("");
  const initializing = loading || account === undefined;

  onCloseRef.current = onClose;
  hasDraftRef.current = Boolean(body.trim() || reportBody.trim());

  const loadThreads = useCallback(async (refresh = false) => {
    if (!refresh && discussionCache.has(cacheKey)) {
      setThreads(discussionCache.get(cacheKey) ?? []);
      setLoadError("");
      setLoading(false);
      return;
    }
    if (!refresh && hasFreshDiscussionError(cacheKey)) {
      setLoadError(DISCUSSION_LOAD_ERROR);
      setLoading(false);
      return;
    }
    const displayLoading = !discussionCache.has(cacheKey);
    const startedAt = performance.now();
    setLoading(displayLoading);
    try {
      let request = refresh ? undefined : discussionRequests.get(cacheKey);
      if (!request) {
        const query = new URLSearchParams({
          document_key: documentKey,
          target_id: target.id,
          target_kind: target.kind,
        });
        if (target.kind === "article") query.set("include_history", "1");
        request = fetch(`/api/discussions?${query}`, {
          credentials: "include",
        }).then(async (response) => {
          const result = await readApiJson<{ threads: DiscussionThread[] }>(
            response,
            DISCUSSION_LOAD_ERROR,
          );
          return result.threads;
        });
        discussionRequests.set(cacheKey, request);
      }
      const result = await request;
      discussionCache.set(cacheKey, result);
      discussionErrorCache.delete(cacheKey);
      setThreads(result);
      setLoadError("");
    } catch {
      discussionErrorCache.set(
        cacheKey,
        Date.now() + DISCUSSION_ERROR_CACHE_MS,
      );
      setLoadError(DISCUSSION_LOAD_ERROR);
    } finally {
      discussionRequests.delete(cacheKey);
      const elapsed = performance.now() - startedAt;
      if (displayLoading) {
        const remaining = DISCUSSION_LOADING_MINIMUM_MS - elapsed;
        if (remaining > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, remaining));
        }
      }
      setLoading(false);
    }
  }, [cacheKey, documentKey, target.id, target.kind]);

  useEffect(() => {
    getAccountState()
      .then((result) => {
        setAccount(result);
      })
      .catch(() => setAccount({ authConfigured: false, user: null }));
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    fetch("/api/config")
      .then((response) => response.ok ? response.json() : undefined)
      .then((result) => {
        if (result?.turnstileSiteKey) setTurnstileSiteKey(result.turnstileSiteKey);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (inline) return;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    closeButtonRef.current?.focus();

    function handleKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!hasDraftRef.current) onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), '
          + 'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.hidden);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => {
      window.removeEventListener("keydown", handleKeyboard);
      previousFocus?.focus();
    };
  }, [inline]);

  async function createThread() {
    if (!body.trim()) return;
    if (turnstileSiteKey && !turnstileToken) {
      setActionError("请先完成人机验证");
      return;
    }
    setActionError("");
    setStatusMessage("");
    try {
      const response = await fetch("/api/discussions", {
        body: JSON.stringify({
          body,
          documentKey,
          targetId: target.id,
          targetKind: target.kind,
          targetRevision: target.revision,
          turnstileToken,
          visibility: privateVisible ? "private" : "public",
        }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      await readApiJson(response, "评论提交失败");
      setBody("");
      setTurnstileToken("");
      setTurnstileKey((value) => value + 1);
      await loadThreads(true);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "评论提交失败");
    }
  }

  async function reportComment(commentId: string) {
    if (!reportBody.trim()) return;
    setActionError("");
    setStatusMessage("");
    try {
      const response = await fetch(`/api/comments/${commentId}/report`, {
        body: JSON.stringify({ reason: reportBody }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      await readApiJson(response, "举报提交失败");
      setReportBody("");
      setReportingComment(undefined);
      setStatusMessage("举报已提交给管理员");
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "举报提交失败");
    }
  }

  return (
    <div
      className={inline ? "discussion-content-shell" : "discussion-dialog-backdrop"}
      onMouseDown={(event) => {
        if (!inline && event.target === event.currentTarget && !hasDraftRef.current) {
          onClose();
        }
      }}
    >
      <div
        aria-labelledby={headingId}
        aria-modal={inline ? undefined : "true"}
        className={inline ? "discussion-inline" : "discussion-panel"}
        ref={dialogRef}
        role={inline ? undefined : "dialog"}
        tabIndex={inline ? undefined : -1}
      >
        <header className="discussion-content-header">
          <div>
            <h2 id={headingId}>{inline ? "评论区" : target.title}</h2>
          </div>
          {!inline ? (
            <IconButton
              aria-label="关闭评论"
              onClick={onClose}
              ref={closeButtonRef}
            >
              <X aria-hidden="true" size={18} />
            </IconButton>
          ) : null}
        </header>

      <div className="discussion-panel-body">
        {initializing || threads.length === 0 ? (
          <div className="discussion-state-slot">
            {initializing ? (
              <StateMessage className="discussion-state-message" role="status">
                正在加载评论……
              </StateMessage>
            ) : null}
            {!initializing && loadError ? (
              <StateMessage className="discussion-state-message">
                {loadError}
              </StateMessage>
            ) : null}
            {!initializing && !loadError ? (
              <StateMessage className="discussion-state-message">
                这里还没有评论
              </StateMessage>
            ) : null}
          </div>
        ) : null}
        {!initializing && !loadError ? threads.map((thread) => (
          <article className="discussion-thread" key={thread.id}>
            {!thread.versionCurrent && thread.quotedText ? (
              <blockquote className="discussion-version-quote">
                {thread.quotedText}
              </blockquote>
            ) : null}
            {thread.comments.map((comment, index) => (
              <div className="discussion-comment" key={comment.id}>
                <div className="discussion-comment-header">
                  <div className="discussion-comment-identity">
                    <strong>{comment.authorName}</strong>
                    <time dateTime={new Date(comment.createdAt).toISOString()}>
                      {new Date(comment.createdAt).toLocaleString("zh-CN")}
                    </time>
                  </div>
                </div>
                <DiscussionMarkdown>{comment.body}</DiscussionMarkdown>
                <div className="discussion-comment-footer">
                  <div className="discussion-comment-context">
                    {index === 0 && thread.visibility === "private" ? (
                      <span>仅自己与管理员可见</span>
                    ) : null}
                    {index === 0 && !thread.versionCurrent ? (
                      <span>
                        {thread.targetKind === "section"
                          ? `历史小节：${thread.targetTitle}`
                          : "旧版本"}
                      </span>
                    ) : null}
                  </div>
                  <div className="discussion-comment-actions">
                    {account?.user && !comment.deleted && !comment.mine
                      && reportingComment !== comment.id ? (
                        <Button
                          onClick={() => {
                            setReportBody("");
                            setReportingComment(comment.id);
                          }}
                          size="text"
                          tone="ghost"
                        >
                          举报
                        </Button>
                      ) : null}
                  </div>
                </div>
                {reportingComment === comment.id ? (
                  <div className="discussion-report-form">
                    <TextAreaField
                      maxLength={500}
                      onChange={(event) => setReportBody(event.target.value)}
                      placeholder="请简要说明举报原因"
                      rows={2}
                      value={reportBody}
                    />
                    <div>
                      <Button
                        onClick={() => {
                          setReportBody("");
                          setReportingComment(undefined);
                        }}
                        size="text"
                        tone="ghost"
                      >
                        取消
                      </Button>
                      <Button
                        className="discussion-primary-action"
                        disabled={!reportBody.trim()}
                        onClick={() => reportComment(comment.id)}
                        size="compact"
                        tone="primary"
                      >
                        提交举报
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </article>
        )) : null}

          {!reportingComment ? (
            <section className="discussion-compose">
              <h3>发表评论</h3>
              <TextAreaField
                disabled={initializing || Boolean(loadError) || !account?.user}
                maxLength={4000}
                onChange={(event) => setBody(event.target.value)}
                placeholder={initializing
                    ? "正在连接评论服务"
                    : loadError
                      ? "评论服务恢复后可以发表评论"
                    : !account.authConfigured
                      ? "当前预览未配置登录服务"
                      : !account.user
                        ? "登录后可以发表评论"
                        : "写下看不懂的地方、补充或建议；支持 Markdown 与 LaTeX"}
                rows={5}
                value={body}
              />
              {!initializing && account.user && !loadError && turnstileSiteKey ? (
                <TurnstileWidget
                  key={turnstileKey}
                  onToken={setTurnstileToken}
                  siteKey={turnstileSiteKey}
                />
              ) : null}
              <div className="discussion-compose-actions">
                <CheckboxField
                  checked={privateVisible}
                  disabled={initializing || Boolean(loadError) || !account?.user}
                  onChange={(event) => setPrivateVisible(event.target.checked)}
                >
                  仅自己与管理员可见
                </CheckboxField>
                {!initializing && account.authConfigured
                    && !account.user && !loadError ? (
                  <Button
                    className="discussion-primary-action"
                    onClick={() => authClient.signIn.social({
                      callbackURL: window.location.href,
                      provider: "github",
                    })}
                    size="compact"
                    tone="primary"
                  >
                    登录后评论
                  </Button>
                ) : (
                  <Button
                    className="discussion-primary-action"
                    disabled={initializing || Boolean(loadError)
                      || !account?.user || !body.trim()}
                    onClick={createThread}
                    size="compact"
                    tone="primary"
                  >
                    提交
                  </Button>
                )}
              </div>
              {statusMessage ? (
                <StateMessage
                  className="discussion-status"
                  role="status"
                  tone="success"
                >
                  {statusMessage}
                </StateMessage>
              ) : null}
              {actionError ? (
                <StateMessage
                  className="discussion-error"
                  role="alert"
                  tone="danger"
                >
                  {actionError}
                </StateMessage>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
