"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { ArticleNavigationView } from "./article-navigation-view";
import { ArticleNeighborsView } from "./article-neighbors-view";
import { ArticleTableOfContents } from "./article-table-of-contents";
import { Button } from "./button";
import { ClientNavigationProvider } from "./client-navigation";
import { CodeBlockEnhancements } from "./code-block-enhancements";
import { CollaborativeArticle } from "./collaborative-article";
import { ContextualSiteHeader } from "./contextual-site-header";
import { LearningProgressSync } from "./learning-progress-sync";
import { LearningQuiz } from "./learning-quiz";
import { LoadingBar } from "./loading-bar";
import { SiteHeader } from "./site-header";

import {
  createRuntimeCatalog,
  getRuntimeArticle,
  getRuntimeNavigationManifest,
  getRuntimeQuiz,
  parseArticleLocation,
  resetRuntimeContentCache,
} from "@/lib/content/runtime-data";
import {
  commitNavigationEntry,
  NAVIGATION_ENTRY_EVENT,
  readNavigationEntry,
} from "@/lib/navigation-entry";

import type {
  ArticleNavigation,
  ArticleRecord,
  DirectoryReturnTarget,
  LearningQuiz as LearningQuizData,
  NavigationMode,
  RenderedArticle,
  TableOfContentsItem,
} from "@/lib/content/types";
import type { NavigationEntryContext } from "@/lib/navigation-entry";

interface LoadedArticle {
  article: ArticleRecord;
  catalogFallback?: DirectoryReturnTarget;
  learningFallback?: DirectoryReturnTarget;
  mode: NavigationMode;
  navigations: ArticleNavigation[];
  quiz?: LearningQuizData;
  rendered: RenderedArticle;
}

function currentRoute() {
  return parseArticleLocation(window.location.pathname);
}

function articleTitle(article: ArticleRecord, mode: NavigationMode) {
  const title = mode === "learning-path"
    ? article.learningTitle
    : article.title;
  return `${article.kind === "extension" ? "*" : ""}${title}`;
}

function resolveEntry(
  articleKey: string,
  mode: NavigationMode,
  navigations: ArticleNavigation[],
) {
  const allowed = new Set(
    navigations.map((navigation) => navigation.activeEntryKey),
  );
  const legacyEntry = new URL(window.location.href).searchParams.get("entry");
  const entryKey = legacyEntry && allowed.has(legacyEntry)
    ? legacyEntry
    : readNavigationEntry(articleKey, mode, allowed)
      ?? navigations[0]?.activeEntryKey;
  if (entryKey) {
    commitNavigationEntry(
      { articleKey, entryKey, mode },
      Boolean(legacyEntry),
    );
  }
  return entryKey;
}

function articleTableOfContents(
  rendered: RenderedArticle,
  mode: NavigationMode,
  quiz?: LearningQuizData,
): TableOfContentsItem[] {
  if (mode !== "learning-path") return rendered.tableOfContents;
  return [
    ...rendered.tableOfContents,
    ...(quiz ? [{
      depth: 2 as const,
      id: "learning-quiz-title",
      supplement: true,
      title: "小测",
    }] : []),
    {
      depth: 2,
      id: "article-comments",
      supplement: true,
      title: "评论区",
    },
  ];
}

function RuntimeLoadingShell() {
  return (
    <>
      <SiteHeader />
      <div className="docs-layout">
        <aside className="module-sidebar" aria-hidden="true" />
        <main className="article-column">
          <article
            aria-busy="true"
            className="markdown-body"
            data-runtime-content="true"
          >
            <div aria-label="正在读取正文" className="article-runtime-loading">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </article>
        </main>
        <aside className="toc-sidebar" aria-hidden="true" />
      </div>
    </>
  );
}

export function RuntimeArticleExperience() {
  const developmentScrollPosition = useRef<number | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);
  const [activeEntryKey, setActiveEntryKey] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState<LoadedArticle>();
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<ReturnType<typeof currentRoute>>();

  useEffect(() => {
    setRoute(currentRoute());
    function handlePopState() {
      setRoute(currentRoute());
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    let disposed = false;
    let releaseId = "";

    async function checkForContentUpdate() {
      try {
        const response = await fetch(
          `/content/release.json?development=${Date.now()}`,
          { cache: "no-store" },
        );
        if (!response.ok || disposed) return;
        const release = await response.json() as { releaseId?: string };
        if (!release.releaseId) return;
        if (!releaseId) {
          releaseId = release.releaseId;
          return;
        }
        if (release.releaseId === releaseId) return;
        releaseId = release.releaseId;
        developmentScrollPosition.current = window.scrollY;
        resetRuntimeContentCache();
        setAttempt((value) => value + 1);
      } catch {
        // 保存过程中 release.json 可能正被原子替换，下一轮会重试。
      }
    }

    void checkForContentUpdate();
    const timer = window.setInterval(checkForContentUpdate, 750);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!route) return;
    const target = route;
    const controller = new AbortController();
    setError("");
    setLoading(true);

    async function load() {
      try {
        const [navigationManifest, content] = await Promise.all([
          getRuntimeNavigationManifest(),
          getRuntimeArticle(
            target.articleKey,
            target.mode,
            controller.signal,
          ),
        ]);
        const catalog = createRuntimeCatalog(navigationManifest);
        const article = catalog.getArticle(target.articleKey);
        if (
          !article?.exists
          || ["计划", "推迟"].includes(article.status)
        ) {
          throw new Error("文章不存在");
        }
        const navigations = target.mode === "learning-path"
          ? catalog.learningNavigations(target.articleKey)
          : catalog.catalogNavigations(target.articleKey);
        if (navigations.length === 0) {
          throw new Error("文章没有可用的导航入口");
        }
        const quiz = target.mode === "learning-path"
          ? await getRuntimeQuiz(content.variant, controller.signal)
          : undefined;
        if (controller.signal.aborted) return;
        const entryKey = resolveEntry(
          target.articleKey,
          target.mode,
          navigations,
        );
        setActiveEntryKey(entryKey ?? navigations[0].activeEntryKey);
        setLoaded({
          article,
          catalogFallback: catalog.catalogFallback(target.articleKey),
          learningFallback: catalog.learningFallback(target.articleKey),
          mode: target.mode,
          navigations,
          quiz,
          rendered: content.rendered,
        });
        document.title = `${articleTitle(article, target.mode)} · 算法竞赛手册`;
        setLoading(false);
      } catch (reason) {
        if (controller.signal.aborted) return;
        console.error(reason);
        setLoaded(undefined);
        setError("正文暂时无法读取，请稍后重试。");
        setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [attempt, route]);

  useEffect(() => {
    function handleEntryChange(event: Event) {
      if (!loaded) return;
      const context = (
        event as CustomEvent<NavigationEntryContext>
      ).detail;
      if (
        context.articleKey !== loaded.article.articleKey
        || context.mode !== loaded.mode
        || !loaded.navigations.some(
          (navigation) => navigation.activeEntryKey === context.entryKey,
        )
      ) {
        return;
      }
      setActiveEntryKey(context.entryKey);
      commitNavigationEntry(context);
    }
    window.addEventListener(NAVIGATION_ENTRY_EVENT, handleEntryChange);
    return () => window.removeEventListener(
      NAVIGATION_ENTRY_EVENT,
      handleEntryChange,
    );
  }, [loaded]);

  useLayoutEffect(() => {
    if (!loaded) return;
    window.dispatchEvent(new CustomEvent("handbook:article-content-ready", {
      detail: { articleKey: loaded.article.articleKey },
    }));
    const savedScrollPosition = developmentScrollPosition.current;
    if (savedScrollPosition !== undefined) {
      developmentScrollPosition.current = undefined;
      window.scrollTo({ top: savedScrollPosition });
      return;
    }
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [loaded]);

  const navigate = useCallback((
    href: string,
    entry?: NavigationEntryContext,
  ) => {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    const nextRoute = parseArticleLocation(url.pathname);
    if (!nextRoute) return false;
    const current = currentRoute();
    if (
      current?.articleKey === nextRoute.articleKey
      && current.mode === nextRoute.mode
      && url.hash
    ) {
      window.history.pushState(window.history.state, "", url);
      document.getElementById(
        decodeURIComponent(url.hash.slice(1)),
      )?.scrollIntoView({ block: "start" });
      return true;
    }
    window.history.pushState({}, "", url);
    if (entry) setActiveEntryKey(entry.entryKey);
    setRoute(nextRoute);
    return true;
  }, []);

  if (!route || loading && !loaded) {
    return (
      <ClientNavigationProvider navigate={navigate}>
        <RuntimeLoadingShell />
      </ClientNavigationProvider>
    );
  }

  if (!loaded) {
    return (
      <ClientNavigationProvider navigate={navigate}>
        <SiteHeader />
        <main className="article-runtime-route-error">
          <p>{error || "文章不存在。"}</p>
          <Button onClick={() => setAttempt((value) => value + 1)}>
            重新读取
          </Button>
        </main>
      </ClientNavigationProvider>
    );
  }

  const navigation = loaded.navigations.find(
    (item) => item.activeEntryKey === activeEntryKey,
  ) ?? loaded.navigations[0];
  const tableOfContents = articleTableOfContents(
    loaded.rendered,
    loaded.mode,
    loaded.quiz,
  );
  const collaborationSections = loaded.rendered.sections.map(
    (section) => ({ ...section, quotedText: "" }),
  );

  return (
    <ClientNavigationProvider navigate={navigate}>
      <LoadingBar active={loading} />
      <ContextualSiteHeader
        articleKey={loaded.article.articleKey}
        catalogFallback={loaded.catalogFallback}
        learningFallback={loaded.learningFallback}
        mode={loaded.mode}
      />
      <div className="docs-layout">
        <ArticleNavigationView
          mode={loaded.mode}
          navigation={navigation}
        />
        <main className="article-column">
          <article
            className="markdown-body"
            data-article-key={loaded.article.articleKey}
            data-content-revision={loaded.rendered.contentRevision}
            data-runtime-content="true"
            dangerouslySetInnerHTML={{ __html: loaded.rendered.html }}
          />
          <CodeBlockEnhancements
            articleKey={loaded.article.articleKey}
            key={loaded.article.articleKey}
          />
          {loaded.mode === "learning-path" ? (
            <>
              <LearningProgressSync
                articleKey={loaded.article.articleKey}
                documentEpoch={loaded.rendered.documentEpoch}
                quiz={loaded.quiz}
              />
              <div className="article-learning-extras">
                {loaded.quiz ? (
                  <LearningQuiz
                    articleKey={loaded.article.articleKey}
                    documentEpoch={loaded.rendered.documentEpoch}
                    key={loaded.article.articleKey}
                    quiz={loaded.quiz}
                  />
                ) : null}
                <CollaborativeArticle
                  articleKey={loaded.article.articleKey}
                  contentRevision={loaded.rendered.contentRevision}
                  key={loaded.article.articleKey}
                  sections={collaborationSections}
                />
              </div>
            </>
          ) : null}
          <ArticleNeighborsView
            mode={loaded.mode}
            previous={navigation.previous}
            next={navigation.next}
          />
        </main>
        <ArticleTableOfContents
          articleKey={loaded.article.articleKey}
          items={tableOfContents}
        />
      </div>
    </ClientNavigationProvider>
  );
}
