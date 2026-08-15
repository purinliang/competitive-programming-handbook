"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getLearningState,
  invalidateLearningState,
} from "@/lib/collaboration-client";

import type { LearningQuiz as LearningQuizData } from "@/lib/content/types";

const STORAGE_KEY = "handbook.learning-progress.v2";

interface StoredAnswer {
  answeredAt: number;
  optionId: string;
  questionRevision: string;
}

interface StoredArticleProgress {
  answers: Record<string, StoredAnswer>;
  documentEpoch?: number;
}

type StoredProgress = Record<string, StoredArticleProgress>;

function readProgress(
  articleKey: string,
  documentEpoch: number,
  quiz: LearningQuizData,
): Record<string, string> {
  try {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as StoredProgress;
    const articleProgress = progress[articleKey];
    if ((articleProgress?.documentEpoch ?? 1) !== documentEpoch) return {};
    const storedAnswers = articleProgress?.answers ?? {};
    return Object.fromEntries(quiz.questions.flatMap((question) => {
      const answer = storedAnswers[question.id];
      return answer?.questionRevision === question.revision
        ? [[question.id, answer.optionId]]
        : [];
    }));
  } catch {
    return {};
  }
}

function writeProgress(
  articleKey: string,
  documentEpoch: number,
  quiz: LearningQuizData,
  answers: Record<string, string>,
) {
  try {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as StoredProgress;
    progress[articleKey] = {
      answers: Object.fromEntries(quiz.questions.flatMap((question) => {
        const optionId = answers[question.id];
        return optionId
          ? [[question.id, {
              answeredAt: Date.now(),
              optionId,
              questionRevision: question.revision,
            }]]
          : [];
      })),
      documentEpoch,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 隐私模式或禁用存储时，题目仍可在当前页面正常作答。
  }
}

export function LearningQuiz({
  articleKey,
  documentEpoch,
  quiz,
}: {
  articleKey: string;
  documentEpoch: number;
  quiz: LearningQuizData;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [explanationVisible, setExplanationVisible] = useState(false);

  const question = quiz.questions[currentIndex];
  const selection = selections[question.id];
  const submittedOptionId = answers[question.id];
  const correctCount = useMemo(
    () => quiz.questions.filter((item) => answers[item.id] === item.correctOptionId).length,
    [answers, quiz.questions],
  );

  useEffect(() => {
    const storedAnswers = readProgress(articleKey, documentEpoch, quiz);
    setAnswers(storedAnswers);
    setSelections(storedAnswers);
    const documentKey = `learning-path:${articleKey}`;
    getLearningState(documentKey)
      .then((state) => {
        if (!state?.questions || state.documentEpoch !== documentEpoch) return;
        const questions = new Map(quiz.questions.map((item) => [item.id, item]));
        const cloudAnswers = Object.fromEntries(
          state.questions.flatMap((attempt: {
            questionId: string;
            questionRevision: string;
            selectedOptionId: string;
          }) => {
            const current = questions.get(attempt.questionId);
            return current?.revision === attempt.questionRevision
              ? [[attempt.questionId, attempt.selectedOptionId]]
              : [];
          }),
        );
        const currentStoredAnswers = readProgress(
          articleKey,
          documentEpoch,
          quiz,
        );
        const merged = { ...cloudAnswers, ...currentStoredAnswers };
        setAnswers(merged);
        setSelections(merged);
        writeProgress(articleKey, documentEpoch, quiz, merged);
      })
      .catch(() => undefined);
  }, [articleKey, documentEpoch, quiz]);

  useEffect(() => {
    setExplanationVisible(false);
  }, [question.id]);

  function choose(optionId: string) {
    setSelections((current) => ({ ...current, [question.id]: optionId }));
    setExplanationVisible(false);
    if (submittedOptionId !== undefined) {
      const nextAnswers = { ...answers };
      delete nextAnswers[question.id];
      setAnswers(nextAnswers);
      writeProgress(articleKey, documentEpoch, quiz, nextAnswers);
    }
  }

  function submit() {
    if (!selection) {
      return;
    }
    const nextAnswers = { ...answers, [question.id]: selection };
    setAnswers(nextAnswers);
    writeProgress(articleKey, documentEpoch, quiz, nextAnswers);
    fetch("/api/learning/questions/attempts", {
      body: JSON.stringify({
        documentKey: `learning-path:${articleKey}`,
        questionId: question.id,
        questionRevision: question.revision,
        selectedOptionId: selection,
      }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
      .then(() => invalidateLearningState(`learning-path:${articleKey}`))
      .catch(() => undefined);
  }

  function moveTo(index: number) {
    setCurrentIndex(index);
  }

  return (
    <section className="learning-quiz" aria-labelledby="learning-quiz-title">
      <header className="learning-quiz-header">
        <h2 id="learning-quiz-title">小测</h2>
        <span>{correctCount} / {quiz.questions.length} 已答对</span>
      </header>

      <nav className="quiz-question-navigation" aria-label="题目导航">
        {quiz.questions.map((item, index) => {
          const answer = answers[item.id];
          const state = answer === undefined ? "unanswered" : answer === item.correctOptionId ? "correct" : "incorrect";
          return (
            <button
              aria-current={index === currentIndex ? "step" : undefined}
              aria-label={`第 ${index + 1} 题${state === "correct" ? "，已答对" : state === "incorrect" ? "，已答错" : ""}`}
              className={index === currentIndex ? "is-active" : undefined}
              data-state={state}
              key={item.id}
              onClick={() => moveTo(index)}
              type="button"
            >
              {index + 1}
            </button>
          );
        })}
      </nav>

      <div className="quiz-question" key={question.id}>
        <h3
          className="quiz-rich-text"
          dangerouslySetInnerHTML={{ __html: question.promptHtml }}
        />
        <div className="quiz-options">
          {question.options.map((option) => {
            const submitted = submittedOptionId !== undefined;
            const isSelected = selection === option.id;
            const state = submitted && isSelected
              ? option.id === question.correctOptionId ? "correct" : "incorrect"
              : undefined;
            return (
              <button
                aria-pressed={isSelected}
                className={isSelected ? "is-selected" : undefined}
                data-state={state}
                key={option.id}
                onClick={() => choose(option.id)}
                type="button"
              >
                <span>{option.id.toUpperCase()}</span>
                <span
                  className="quiz-option-text quiz-rich-text"
                  dangerouslySetInnerHTML={{ __html: option.textHtml }}
                />
              </button>
            );
          })}
        </div>

        <div className="quiz-actions">
          <div className="quiz-feedback" aria-live="polite">
            {submittedOptionId !== undefined ? (
              <p
                className="quiz-result"
                data-state={submittedOptionId === question.correctOptionId
                  ? "correct"
                  : "incorrect"}
              >
                {submittedOptionId === question.correctOptionId
                  ? "回答正确"
                  : "回答错误，可以重新选择后再次提交"}
              </p>
            ) : <span />}
            <button
              className="quiz-explanation-toggle"
              disabled={submittedOptionId === undefined}
              onClick={() => setExplanationVisible((visible) => !visible)}
              type="button"
            >
              {explanationVisible ? "隐藏解析" : "查看解析"}
            </button>
          </div>
          <button
            className="quiz-submit"
            disabled={!selection || submittedOptionId !== undefined}
            onClick={submit}
            type="button"
          >
            提交
          </button>
        </div>
        {explanationVisible ? (
          <div className="quiz-explanation">
            <strong>解析</strong>
            <p
              className="quiz-rich-text"
              dangerouslySetInnerHTML={{ __html: question.explanationHtml }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
