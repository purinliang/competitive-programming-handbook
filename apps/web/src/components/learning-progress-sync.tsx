"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  ArticleSection,
  LearningQuiz,
} from "@/lib/content/types";

const SECTION_STORAGE_KEY = "handbook.section-progress.v1";
const QUIZ_STORAGE_KEY = "handbook.learning-progress.v2";
const DISMISSED_STORAGE_KEY = "handbook.learning-sync-dismissed.v1";

interface LocalSection {
  id: string;
  revision: string;
}

interface LocalAnswer {
  optionId: string;
  questionId: string;
  revision: string;
}

interface PendingRecords {
  answers: LocalAnswer[];
  sections: LocalSection[];
}

function readLocalRecords(
  articleKey: string,
  documentKey: string,
  quiz: LearningQuiz | undefined,
  sections: ArticleSection[],
): PendingRecords {
  let localSections: LocalSection[] = [];
  let localAnswers: LocalAnswer[] = [];
  try {
    const stored = JSON.parse(localStorage.getItem(SECTION_STORAGE_KEY) ?? "{}") as Record<
      string,
      Record<string, { revision?: string }>
    >;
    localSections = sections.flatMap((section) => (
      stored[documentKey]?.[section.id]?.revision === section.revision
        ? [{ id: section.id, revision: section.revision }]
        : []
    ));
  } catch {
    // 损坏或被禁用的本地存储不阻塞公开阅读。
  }

  try {
    const stored = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) ?? "{}") as Record<
      string,
      { answers?: Record<string, { optionId?: string; questionRevision?: string }> }
    >;
    localAnswers = (quiz?.questions ?? []).flatMap((question) => {
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
  }
  return { answers: localAnswers, sections: localSections };
}

function pendingSignature(records: PendingRecords) {
  return JSON.stringify(records);
}

export function LearningProgressSync({
  articleKey,
  quiz,
  sections,
}: {
  articleKey: string;
  quiz?: LearningQuiz;
  sections: ArticleSection[];
}) {
  const documentKey = `learning-path:${articleKey}`;
  const [pending, setPending] = useState<PendingRecords>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const count = useMemo(
    () => (pending?.answers.length ?? 0) + (pending?.sections.length ?? 0),
    [pending],
  );

  useEffect(() => {
    let cancelled = false;
    async function detectPendingRecords() {
      try {
        const accountResponse = await fetch("/api/me", { credentials: "include" });
        if (!accountResponse.ok) return;
        const account = await accountResponse.json();
        if (!account.user?.id) return;

        const local = readLocalRecords(articleKey, documentKey, quiz, sections);
        if (local.answers.length === 0 && local.sections.length === 0) return;
        const stateResponse = await fetch(
          `/api/learning/state?document_key=${encodeURIComponent(documentKey)}`,
          { credentials: "include" },
        );
        if (!stateResponse.ok) return;
        const cloud = await stateResponse.json();
        const cloudSections = new Map(cloud.sections.map((record: {
          sectionId: string;
          sectionRevision: string;
        }) => [record.sectionId, record.sectionRevision]));
        const cloudAnswers = new Map<string, {
          questionRevision: string;
          selectedOptionId: string;
        }>(cloud.questions.map((record: {
          questionId: string;
          questionRevision: string;
          selectedOptionId: string;
        }) => [record.questionId, record]));
        const records = {
          answers: local.answers.filter((answer) => {
            const current = cloudAnswers.get(answer.questionId);
            return current?.questionRevision !== answer.revision
              || current.selectedOptionId !== answer.optionId;
          }),
          sections: local.sections.filter(
            (section) => cloudSections.get(section.id) !== section.revision,
          ),
        };
        if (records.answers.length === 0 && records.sections.length === 0) return;
        const dismissedKey = `${account.user.id}:${documentKey}`;
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
  }, [articleKey, documentKey, quiz, sections]);

  async function synchronize() {
    if (!pending) return;
    setSaving(true);
    setError("");
    try {
      for (const section of pending.sections) {
        const response = await fetch("/api/learning/sections", {
          body: JSON.stringify({
            documentKey,
            read: true,
            sectionId: section.id,
            sectionRevision: section.revision,
          }),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        if (!response.ok) throw new Error("分节进度同步失败");
      }
      for (const answer of pending.answers) {
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
        if (!response.ok) throw new Error("小测验记录同步失败");
      }
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
      const accountResponse = await fetch("/api/me", { credentials: "include" });
      const account = accountResponse.ok ? await accountResponse.json() : undefined;
      if (account?.user?.id) {
        const key = `${account.user.id}:${documentKey}`;
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
      <p>检测到 {count} 条尚未保存在账号中的有效记录。</p>
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
