"use client";

import { useEffect, useSyncExternalStore } from "react";

import { getLearningProgress } from "@/lib/collaboration-client";
import {
  LEARNING_PROGRESS_CHANGED_EVENT,
  LEARNING_PROGRESS_STORAGE_KEY,
  readStoredLearningProgress,
} from "@/lib/learning-progress-storage";

import type {
  LearningProgressManifest,
  LearningQuizProgressDefinition,
} from "@/lib/content/types";
import type { LearningProgressSummary } from "@/lib/collaboration-client";
import type { StoredLearningProgress } from "@/lib/learning-progress-storage";

const listeners = new Set<() => void>();
let initialized = false;
let ready = false;
let revision = 0;
let localProgress: StoredLearningProgress = {};
let accountProgress = new Map<string, LearningProgressSummary["articles"][number]>();
let definitions = new Map<string, LearningQuizProgressDefinition>();

function emitChange() {
  revision += 1;
  for (const listener of listeners) listener();
}

function refreshLocalProgress() {
  localProgress = readStoredLearningProgress();
  emitChange();
}

function initializeProgress() {
  if (initialized) return;
  initialized = true;
  refreshLocalProgress();
  window.addEventListener(LEARNING_PROGRESS_CHANGED_EVENT, refreshLocalProgress);
  window.addEventListener("storage", (event) => {
    if (event.key === LEARNING_PROGRESS_STORAGE_KEY) refreshLocalProgress();
  });
  fetch("/learning-progress.json")
    .then(async (response) => {
      if (!response.ok) throw new Error("小测清单加载失败");
      const manifest = await response.json() as LearningProgressManifest;
      definitions = new Map(Object.entries(manifest.articles));
      ready = true;
      emitChange();
    })
    .catch(() => undefined);
  getLearningProgress()
    .then((summary) => {
      if (!summary) return;
      accountProgress = new Map(summary.articles.flatMap((article) => {
        const prefix = "learning-path:";
        return article.documentKey.startsWith(prefix)
          ? [[article.documentKey.slice(prefix.length), article]]
          : [];
      }));
      emitChange();
    })
    .catch(() => undefined);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function currentRevision() {
  return revision;
}

function serverRevision() {
  return 0;
}

function questionIsCorrect(
  articleKey: string,
  quiz: LearningQuizProgressDefinition,
  question: LearningQuizProgressDefinition["questions"][number],
) {
  const localArticle = localProgress[articleKey];
  const localAnswer = (localArticle?.documentEpoch ?? 1) === quiz.documentEpoch
    ? localArticle?.answers?.[question.id]
    : undefined;
  const validLocal = localAnswer?.questionRevision === question.revision
    ? localAnswer
    : undefined;

  const cloudArticle = accountProgress.get(articleKey);
  const cloudAnswer = cloudArticle?.documentEpoch === quiz.documentEpoch
    ? cloudArticle.questions.find((item) => (
        item.questionId === question.id
        && item.questionRevision === question.revision
      ))
    : undefined;

  if (!validLocal) return cloudAnswer?.correct ?? false;
  if (!cloudAnswer || validLocal.answeredAt >= cloudAnswer.createdAt) {
    return validLocal.optionId === question.correctOptionId;
  }
  return cloudAnswer.correct;
}

function articleIsComplete(articleKey: string) {
  const quiz = definitions.get(articleKey);
  return Boolean(
    quiz?.questions.length
    && quiz.questions.every((question) => questionIsCorrect(articleKey, quiz, question)),
  );
}

function useProgressRevision() {
  const current = useSyncExternalStore(subscribe, currentRevision, serverRevision);
  useEffect(initializeProgress, []);
  return current;
}

export function ArticleProgress({ articleKey }: { articleKey: string }) {
  useProgressRevision();
  const complete = ready && articleIsComplete(articleKey);
  return (
    <small
      aria-label={complete ? "小测已全部答对" : undefined}
      className={`article-progress${complete ? " is-complete" : ""}`}
      role={complete ? "img" : undefined}
    />
  );
}

export function ArticleGroupProgress({ articleKeys }: { articleKeys: string[] }) {
  useProgressRevision();
  const tracked = [...new Set(articleKeys)].filter((articleKey) => (
    definitions.get(articleKey)?.questions.length
  ));
  const completed = tracked.filter(articleIsComplete).length;
  const label = ready && tracked.length > 0 ? `${completed}/${tracked.length}` : "";
  return (
    <small
      aria-label={label ? `${completed} 篇已完成，共 ${tracked.length} 篇` : undefined}
      className="article-group-progress"
    >
      {label}
    </small>
  );
}
