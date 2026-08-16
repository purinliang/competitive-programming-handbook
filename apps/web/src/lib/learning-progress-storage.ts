export const LEARNING_PROGRESS_STORAGE_KEY = "handbook.learning-progress.v2";
export const LEARNING_PROGRESS_CHANGED_EVENT = "handbook:learning-progress-changed";

export interface StoredLearningAnswer {
  answeredAt: number;
  optionId: string;
  questionRevision: string;
}

export interface StoredArticleProgress {
  answers: Record<string, StoredLearningAnswer>;
  documentEpoch?: number;
}

export type StoredLearningProgress = Record<string, StoredArticleProgress>;

interface QuestionIdentity {
  id: string;
  revision: string;
}

export function readStoredLearningProgress(): StoredLearningProgress {
  try {
    return JSON.parse(
      localStorage.getItem(LEARNING_PROGRESS_STORAGE_KEY) ?? "{}",
    ) as StoredLearningProgress;
  } catch {
    return {};
  }
}

export function readStoredAnswers(
  articleKey: string,
  documentEpoch: number,
  questions: QuestionIdentity[],
): Record<string, string> {
  const article = readStoredLearningProgress()[articleKey];
  if ((article?.documentEpoch ?? 1) !== documentEpoch) return {};
  return Object.fromEntries(questions.flatMap((question) => {
    const answer = article?.answers?.[question.id];
    return answer?.questionRevision === question.revision
      ? [[question.id, answer.optionId]]
      : [];
  }));
}

export function writeStoredAnswers(
  articleKey: string,
  documentEpoch: number,
  questions: QuestionIdentity[],
  answers: Record<string, string>,
) {
  try {
    const progress = readStoredLearningProgress();
    const previous = progress[articleKey];
    const now = Date.now();
    progress[articleKey] = {
      answers: Object.fromEntries(questions.flatMap((question) => {
        const optionId = answers[question.id];
        if (!optionId) return [];
        const existing = previous?.answers?.[question.id];
        const unchanged = (previous?.documentEpoch ?? 1) === documentEpoch
          && existing?.optionId === optionId
          && existing.questionRevision === question.revision;
        return [[question.id, {
          answeredAt: unchanged ? existing.answeredAt : now,
          optionId,
          questionRevision: question.revision,
        }]];
      })),
      documentEpoch,
    };
    localStorage.setItem(LEARNING_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new Event(LEARNING_PROGRESS_CHANGED_EVENT));
  } catch {
    // 隐私模式或禁用存储时，题目仍可在当前页面正常作答。
  }
}
