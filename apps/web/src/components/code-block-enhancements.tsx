"use client";

import { useEffect } from "react";

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function CodeBlockEnhancements({ articleKey }: { articleKey: string }) {
  useEffect(() => {
    const buttons: HTMLButtonElement[] = [];
    const timers = new Set<number>();

    function enhance() {
      const article = document.querySelector<HTMLElement>(
        `[data-article-key="${CSS.escape(articleKey)}"]`,
      );
      if (!article) return;

      for (const figure of article.querySelectorAll<HTMLElement>(
        "[data-rehype-pretty-code-figure]",
      )) {
        if (figure.querySelector(":scope > .code-copy-button")) continue;
        const code = figure.querySelector("pre code");
        if (!code) continue;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "code-copy-button";
        button.textContent = "复制";
        button.setAttribute("aria-label", "复制代码");
        button.addEventListener("click", async () => {
          try {
            await copyText(code.textContent ?? "");
            button.textContent = "已复制";
            button.dataset.state = "copied";
          } catch {
            button.textContent = "复制失败";
            button.dataset.state = "failed";
          }

          const timer = window.setTimeout(() => {
            button.textContent = "复制";
            delete button.dataset.state;
            timers.delete(timer);
          }, 1600);
          timers.add(timer);
        });
        figure.append(button);
        buttons.push(button);
      }
    }

    function handleContentReady(event: Event) {
      const readyEvent = event as CustomEvent<{ articleKey?: string }>;
      if (readyEvent.detail?.articleKey === articleKey) enhance();
    }

    enhance();
    window.addEventListener(
      "handbook:article-content-ready",
      handleContentReady,
    );

    return () => {
      window.removeEventListener(
        "handbook:article-content-ready",
        handleContentReady,
      );
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
      for (const button of buttons) {
        button.remove();
      }
    };
  }, [articleKey]);

  return null;
}
