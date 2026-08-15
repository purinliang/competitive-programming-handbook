import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { NavigationProgress } from "@/components/navigation-progress";

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
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          id="article-navigation-mode"
          dangerouslySetInnerHTML={{
            __html: 'document.documentElement.dataset.articleNavigation=new URLSearchParams(location.search).get("nav")==="learn"?"learn":"catalog"',
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
