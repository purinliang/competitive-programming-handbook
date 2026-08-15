"use client";

import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export function DiscussionMarkdown({ children }: { children: string }) {
  return (
    <div className="discussion-markdown">
      <ReactMarkdown
        components={{
          a: ({ children: linkText, href }) => (
            <a href={href} rel="nofollow ugc noopener noreferrer" target="_blank">
              {linkText}
            </a>
          ),
        }}
        rehypePlugins={[rehypeKatex]}
        remarkPlugins={[remarkGfm, remarkMath]}
        skipHtml
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
