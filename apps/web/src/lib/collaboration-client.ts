export interface AccountState {
  authConfigured: boolean;
  user: null | {
    email: string;
    id: string;
    image?: string | null;
    name: string;
    role: "admin" | "student";
  };
}

export interface LearningState {
  documentEpoch: number;
  questions: Array<{
    correct: number;
    createdAt: number;
    questionId: string;
    questionRevision: string;
    selectedOptionId: string;
  }>;
  sections: Array<{
    readAt: number;
    sectionId: string;
    sectionRevision: string;
    updatedAt: number;
  }>;
}

let accountRequest: Promise<AccountState> | undefined;
const learningStateRequests = new Map<string, Promise<LearningState | undefined>>();

export function getAccountState() {
  if (!accountRequest) {
    accountRequest = fetch("/api/me", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("账户状态加载失败");
        return await response.json() as AccountState;
      })
      .catch((error) => {
        accountRequest = undefined;
        throw error;
      });
  }
  return accountRequest;
}

export function getLearningState(documentKey: string) {
  const cached = learningStateRequests.get(documentKey);
  if (cached) return cached;

  const request = getAccountState()
    .then(async (account) => {
      if (!account.user) return undefined;
      const response = await fetch(
        `/api/learning/state?document_key=${encodeURIComponent(documentKey)}`,
        { credentials: "include" },
      );
      if (!response.ok) throw new Error("学习状态加载失败");
      return await response.json() as LearningState;
    })
    .catch((error) => {
      learningStateRequests.delete(documentKey);
      throw error;
    });
  learningStateRequests.set(documentKey, request);
  return request;
}

export function invalidateLearningState(documentKey: string) {
  learningStateRequests.delete(documentKey);
}

export function resetAccountState() {
  accountRequest = undefined;
  learningStateRequests.clear();
}
