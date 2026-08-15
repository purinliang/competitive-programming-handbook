"use client";

import { useEffect, useState } from "react";

import {
  getAccountState,
  getLearningState,
  invalidateLearningState,
} from "@/lib/collaboration-client";

import type { LearningQuiz } from "@/lib/content/types";

const QUIZ_STORAGE_KEY = "handbook.learning-progress.v2";
const DISMISSED_STORAGE_KEY = "handbook.learning-sync-dismissed.v1";

interface LocalAnswer {
  optionId: string;
  questionId: string;
  revision: string;
}

function readLocalAnswers(
  articleKey: string,
  documentEpoch: number,
  quiz: LearningQuiz | undefined,
): LocalAnswer[] {
  try {
    const stored = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) ?? "{}") as Record<
      string,
      {
        answers?: Record<string, { optionId?: string; questionRevision?: string }>;
        documentEpoch?: number;
      }
    >;
    if ((stored[articleKey]?.documentEpoch ?? 1) !== documentEpoch) {
      return [];
    }
    return (quiz?.questions ?? []).flatMap((question) => {
      const answer = stored[articleKey]?.answers?.[question.id];
      return answer?.optionId && answer.questionRevision === question.revision
        ? [{
            optionId: answer.optionId,
            questionId: question.id,
            revision: question.revision,
          }]
        : [];
    });
  } catch {
    // 损坏或被禁用的本地存储不阻塞公开阅读。
    return [];
  }
}

function pendingSignature(records: LocalAnswer[]) {
  return JSON.stringify(records);
}

export function LearningProgressSync({
  articleKey,
  documentEpoch,
  quiz,
}: {
  articleKey: string;
  documentEpoch: number;
  quiz?: LearningQuiz;
}) {
  const documentKey = `learning-path:${articleKey}`;
  const [pending, setPending] = useState<LocalAnswer[]>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const count = pending?.length ?? 0;

  useEffect(() => {
    let cancelled = false;
    async function detectPendingRecords() {
      try {
        const account = await getAccountState();
        if (!account.user?.id) return;

        const local = readLocalAnswers(
          articleKey,
          documentEpoch,
          quiz,
        );
        if (local.length === 0) return;
        const cloud = await getLearningState(documentKey);
        if (!cloud || cloud.documentEpoch !== documentEpoch) return;
        const cloudAnswers = new Map<string, {
          questionRevision: string;
          selectedOptionId: string;
        }>(cloud.questions.map((record: {
          questionId: string;
          questionRevision: string;
          selectedOptionId: string;
        }) => [record.questionId, record]));
        const records = local.filter((answer) => {
          const current = cloudAnswers.get(answer.questionId);
          return current?.questionRevision !== answer.revision
            || current.selectedOptionId !== answer.optionId;
        });
        if (records.length === 0) return;
        const dismissedKey = `${account.user.id}:${documentKey}:${documentEpoch}`;
        const dismissed = JSON.parse(
          localStorage.getItem(DISMISSED_STORAGE_KEY) ?? "{}",
        ) as Record<string, string>;
        if (!cancelled && dismissed[dismissedKey] !== pendingSignature(records)) {
          setPending(records);
        }
      } catch {
        // 登录与 D1 暂时不可用时，本地状态继续独立工作。
      }
    }
    detectPendingRecords();
    return () => {
      cancelled = true;
    };
  }, [articleKey, documentEpoch, documentKey, quiz]);

  async function synchronize() {
    if (!pending) return;
    setSaving(true);
    setError("");
    try {
      for (const answer of pending) {
        const response = await fetch("/api/learning/questions/attempts", {
          body: JSON.stringify({
            documentKey,
            questionId: answer.questionId,
            questionRevision: answer.revision,
            selectedOptionId: answer.optionId,
          }),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        if (!response.ok) throw new Error("小测记录同步失败");
      }
      invalidateLearningState(documentKey);
      setPending(undefined);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "学习记录同步失败");
    } finally {
      setSaving(false);
    }
  }

  async function keepLocal() {
    if (!pending) return;
    try {
      const account = await getAccountState();
      if (account?.user?.id) {
        const key = `${account.user.id}:${documentKey}:${documentEpoch}`;
        const dismissed = JSON.parse(
          localStorage.getItem(DISMISSED_STORAGE_KEY) ?? "{}",
        ) as Record<string, string>;
        dismissed[key] = pendingSignature(pending);
        localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(dismissed));
      }
    } catch {
      // 即使无法保存“不再询问”，也应立即关闭提示。
    }
    setPending(undefined);
  }

  if (!pending || count === 0) return null;
  return (
    <aside className="learning-sync-prompt" aria-live="polite">
      <strong>同步本机学习记录？</strong>
      <p>检测到 {count} 条尚未保存在账号中的小测记录。</p>
      {error ? <p className="learning-sync-error">{error}</p> : null}
      <div>
        <button disabled={saving} onClick={keepLocal} type="button">仅保存在本机</button>
        <button disabled={saving} onClick={synchronize} type="button">
          {saving ? "正在同步……" : "同步到账号"}
        </button>
      </div>
    </aside>
  );
}
