export function getArticleStatusLabel(status: string): string {
  return status === "待审阅" ? "未审阅" : status;
}
