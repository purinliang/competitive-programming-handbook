import type { Metadata } from "next";

import { RuntimeArticleExperience } from "@/components/runtime-article-experience";

export const metadata: Metadata = { title: "正文" };

export default function ReaderPage() {
  return <RuntimeArticleExperience />;
}
