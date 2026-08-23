"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

import { Button } from "./button";

import type {
  NavigationMode,
  RenderedArticle,
} from "@/lib/content/types";

interface RuntimeContentVariant {
  bytes: number;
  contentHash: string;
  contentRevision: string;
  documentEpoch: number;
  objectPath: string;
}

interface RuntimeContentManifest {
  articles: Record<string, Partial<Record<NavigationMode, RuntimeContentVariant>>>;
  version: 1;
}

async function readJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return await response.json() as T;
}

export function RuntimeArticleBody({
  articleKey,
  expectedContentRevision,
  mode,
}: {
  articleKey: string;
  expectedContentRevision: string;
  mode: NavigationMode;
}) {
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState("");
  const [rendered, setRendered] = useState<RenderedArticle>();

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    setRendered(undefined);

    async function load() {
      try {
        const manifest = await readJson<RuntimeContentManifest>(
          "/content/article-manifest.json",
          {
            cache: "no-cache",
            signal: controller.signal,
          },
        );
        const variant = manifest.articles[articleKey]?.[mode];
        if (!variant) {
          throw new Error("正文索引中没有这篇文章");
        }
        if (!variant.objectPath.includes(variant.contentHash)) {
          throw new Error("正文索引未通过完整性检查");
        }

        const content = await readJson<RenderedArticle>(variant.objectPath, {
          cache: "force-cache",
          signal: controller.signal,
        });
        if (
          content.contentRevision !== variant.contentRevision
          || content.contentRevision !== expectedContentRevision
        ) {
          throw new Error("页面与正文版本暂时不同步");
        }
        setRendered(content);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error(loadError);
        setError("正文暂时无法读取，请稍后重试。");
      }
    }

    void load();
    return () => controller.abort();
  }, [articleKey, attempt, expectedContentRevision, mode]);

  useLayoutEffect(() => {
    if (!rendered) return;
    window.dispatchEvent(new CustomEvent("handbook:article-content-ready", {
      detail: { articleKey },
    }));

    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    }
  }, [articleKey, rendered]);

  if (rendered) {
    return (
      <article
        className="markdown-body"
        data-article-key={articleKey}
        data-content-revision={rendered.contentRevision}
        data-runtime-content="true"
        dangerouslySetInnerHTML={{ __html: rendered.html }}
      />
    );
  }

  return (
    <article
      aria-busy={!error}
      className="markdown-body"
      data-article-key={articleKey}
      data-runtime-content="true"
    >
      {!error ? (
        <div aria-label="正在读取正文" className="article-runtime-loading">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : (
        <div className="article-runtime-error" role="status">
          <p>{error}</p>
          <Button onClick={() => setAttempt((value) => value + 1)}>
            重新读取
          </Button>
        </div>
      )}
    </article>
  );
}
