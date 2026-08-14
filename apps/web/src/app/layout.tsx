import type { Metadata } from "next";
import type { ReactNode } from "react";

import "katex/dist/katex.min.css";
import "./theme.css";
import "./styles.css";
import "./article.css";

export const metadata: Metadata = {
  title: {
    default: "算法竞赛手册",
    template: "%s · 算法竞赛手册",
  },
  description: "从 C++ 基础到高中竞赛进阶的免费算法竞赛教程。",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
