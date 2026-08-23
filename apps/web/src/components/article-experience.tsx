import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleNavigationView } from "./article-navigation-view";
import { ArticleNeighborsView } from "./article-neighbors-view";
import { ArticleTableOfContents } from "./article-table-of-contents";
import { CodeBlockEnhancements } from "./code-block-enhancements";
import { CollaborativeArticle } from "./collaborative-article";
import { ContextualSiteHeader } from "./contextual-site-header";
import {
  ContextualArticleNavigation,
  ContextualArticleNeighbors,
} from "./contextual-article-navigation";
import { LearningQuiz } from "./learning-quiz";
import { LearningProgressSync } from "./learning-progress-sync";
import { RuntimeArticleBody } from "./runtime-article-body";
import { SiteHeader } from "./site-header";

import {
  getArticle,
  getCatalogDirectoryFallback,
  getArticleLearningNavigations,
  getArticleModuleNavigations,
  getLearningDirectoryFallback,
} from "@/lib/content/catalog";
import { getLearningQuiz, getRenderedArticle } from "@/lib/content/compiled";
import runtimeContent from "../../runtime-content.json";

import type { NavigationMode } from "@/lib/content/types";

const runtimeArticleKeys = new Set(runtimeContent.articles);

export async function ArticleExperience({
  articleKey,
  mode,
}: {
  articleKey: string;
  mode: NavigationMode;
}) {
  const article = getArticle(articleKey);
  if (!article?.exists || article.status === "计划") {
    notFound();
  }

  const learningNavigations = getArticleLearningNavigations(article.articleKey);
  const moduleNavigations = getArticleModuleNavigations(article.articleKey);
  const navigations = mode === "learning-path" ? learningNavigations : moduleNavigations;
  const defaultNavigation = navigations[0];
  if (!defaultNavigation) {
    notFound();
  }

  const rendered = await getRenderedArticle(article, mode);
  const usesRuntimeContent = runtimeArticleKeys.has(article.articleKey);
  const collaborationSections = usesRuntimeContent
    ? rendered.sections.map((section) => ({ ...section, quotedText: "" }))
    : rendered.sections;
  const quiz = mode === "learning-path" ? await getLearningQuiz(article) : undefined;
  const tableOfContents = mode === "learning-path"
    ? [
        ...rendered.tableOfContents,
        ...(quiz ? [{
          depth: 2 as const,
          id: "learning-quiz-title",
          supplement: true,
          title: "小测",
        }] : []),
        {
          depth: 2 as const,
          id: "article-comments",
          supplement: true,
          title: "评论区",
        },
      ]
    : rendered.tableOfContents;

  return (
    <>
      <Suspense fallback={<SiteHeader activeSection={mode} />}>
        <ContextualSiteHeader
          articleKey={article.articleKey}
          catalogFallback={getCatalogDirectoryFallback(article.articleKey)}
          learningFallback={getLearningDirectoryFallback(article.articleKey)}
          mode={mode}
        />
      </Suspense>
      <div className="docs-layout">
        <Suspense
          fallback={<ArticleNavigationView mode={mode} navigation={defaultNavigation} />}
        >
          <ContextualArticleNavigation
            articleKey={article.articleKey}
            mode={mode}
            navigations={navigations}
          />
        </Suspense>

        <main className="article-column">
          {usesRuntimeContent ? (
            <RuntimeArticleBody
              articleKey={article.articleKey}
              expectedContentRevision={rendered.contentRevision}
              key={`${mode}:${article.articleKey}`}
              mode={mode}
            />
          ) : (
            <article
              className="markdown-body"
              data-article-key={article.articleKey}
              data-content-revision={rendered.contentRevision}
              dangerouslySetInnerHTML={{ __html: rendered.html }}
            />
          )}
          <CodeBlockEnhancements articleKey={article.articleKey} />
          {mode === "learning-path" ? (
            <>
              <LearningProgressSync
                articleKey={article.articleKey}
                documentEpoch={rendered.documentEpoch}
                quiz={quiz}
              />
              <div className="article-learning-extras">
                {quiz ? (
                  <LearningQuiz
                    articleKey={article.articleKey}
                    documentEpoch={rendered.documentEpoch}
                    quiz={quiz}
                  />
                ) : null}
                <CollaborativeArticle
                  articleKey={article.articleKey}
                  contentRevision={rendered.contentRevision}
                  sections={collaborationSections}
                />
              </div>
            </>
          ) : null}
          <Suspense
            fallback={(
              <ArticleNeighborsView
                mode={mode}
                previous={defaultNavigation.previous}
                next={defaultNavigation.next}
              />
            )}
          >
            <ContextualArticleNeighbors
              articleKey={article.articleKey}
              mode={mode}
              navigations={navigations}
            />
          </Suspense>
        </main>

        <ArticleTableOfContents articleKey={article.articleKey} items={tableOfContents} />
      </div>
    </>
  );
}
