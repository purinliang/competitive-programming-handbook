"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { LearningQuiz as LearningQuizData } from "@/lib/content/types";

const STORAGE_KEY = "handbook.learning-progress.v1";

interface StoredArticleProgress {
  quizRevision: string;
  answers: Record<string, string>;
}

type StoredProgress = Record<string, StoredArticleProgress>;

function readProgress(articleKey: string, revision: string): Record<string, string> {
  try {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as StoredProgress;
    return progress[articleKey]?.quizRevision === revision ? progress[articleKey].answers : {};
  } catch {
    return {};
  }
}

function writeProgress(articleKey: string, revision: string, answers: Record<string, string>) {
  try {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as StoredProgress;
    progress[articleKey] = { quizRevision: revision, answers };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 隐私模式或禁用存储时，题目仍可在当前页面正常作答。
  }
}

export function LearningQuiz({ articleKey, quiz }: { articleKey: string; quiz: LearningQuizData }) {
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
    const storedAnswers = readProgress(articleKey, quiz.revision);
    setAnswers(storedAnswers);
    setSelections(storedAnswers);
  }, [articleKey, quiz.revision]);

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
      writeProgress(articleKey, quiz.revision, nextAnswers);
    }
  }

  function submit() {
    if (!selection) {
      return;
    }
    const nextAnswers = { ...answers, [question.id]: selection };
    setAnswers(nextAnswers);
    writeProgress(articleKey, quiz.revision, nextAnswers);
  }

  function moveTo(index: number) {
    setCurrentIndex(index);
  }

  return (
    <section className="learning-quiz" aria-labelledby="learning-quiz-title">
      <header className="learning-quiz-header">
        <div>
          <p>Takeaway</p>
          <h2 id="learning-quiz-title">知识检查</h2>
        </div>
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
        <p className="quiz-question-number">第 {currentIndex + 1} 题</p>
        <h3>{question.prompt}</h3>
        <div className="quiz-options">
          {question.options.map((option) => {
            const submitted = submittedOptionId !== undefined;
            const isSelected = selection === option.id;
            const state = submitted
              ? option.id === question.correctOptionId
                ? "correct"
                : isSelected
                  ? "incorrect"
                  : undefined
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
                {option.text}
              </button>
            );
          })}
        </div>

        <div className="quiz-actions">
          <button className="quiz-secondary-action" disabled={currentIndex === 0} onClick={() => moveTo(currentIndex - 1)} type="button">
            <ChevronLeft aria-hidden="true" size={16} />上一题
          </button>
          <div>
            <button className="quiz-secondary-action" disabled={submittedOptionId === undefined} onClick={() => setExplanationVisible((visible) => !visible)} type="button">
              {explanationVisible ? "收起解析" : "查看解析"}
            </button>
            <button className="quiz-submit" disabled={!selection || submittedOptionId !== undefined} onClick={submit} type="button">提交</button>
          </div>
          <button className="quiz-secondary-action" disabled={currentIndex === quiz.questions.length - 1} onClick={() => moveTo(currentIndex + 1)} type="button">
            下一题<ChevronRight aria-hidden="true" size={16} />
          </button>
        </div>

        {submittedOptionId !== undefined ? (
          <p className="quiz-result" data-state={submittedOptionId === question.correctOptionId ? "correct" : "incorrect"}>
            {submittedOptionId === question.correctOptionId ? "回答正确" : "回答错误，可以重新选择后再次提交。"}
          </p>
        ) : null}
        {explanationVisible ? <div className="quiz-explanation"><strong>解析</strong><p>{question.explanation}</p></div> : null}
      </div>
    </section>
  );
}
