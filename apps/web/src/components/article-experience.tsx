import { notFound } from "next/navigation";

import { ArticleNavigationView } from "./article-navigation-view";
import { ArticleNeighborsView } from "./article-neighbors-view";
import { ArticleTableOfContents } from "./article-table-of-contents";
import { CodeBlockEnhancements } from "./code-block-enhancements";
import { CollaborativeArticle } from "./collaborative-article";
import { LearningQuiz } from "./learning-quiz";
import { LearningProgressSync } from "./learning-progress-sync";
import { SiteHeader } from "./site-header";

import {
  getArticle,
  getArticleLearningNavigation,
  getArticleLearningNeighbors,
  getArticleModuleNavigation,
  getArticleModuleNeighbors,
} from "@/lib/content/catalog";
import { getLearningQuiz, getRenderedArticle } from "@/lib/content/compiled";

import type { NavigationMode } from "@/lib/content/types";

export async function ArticleExperience({ articleKey, mode }: { articleKey: string; mode: NavigationMode }) {
  const article = getArticle(articleKey);
  if (!article?.exists || article.status === "计划") {
    notFound();
  }

  const navigation = mode === "learning-path"
    ? getArticleLearningNavigation(article.articleKey)
    : getArticleModuleNavigation(article.articleKey);
  if (!navigation) {
    notFound();
  }

  const neighbors = mode === "learning-path"
    ? getArticleLearningNeighbors(article.articleKey)
    : getArticleModuleNeighbors(article.articleKey);
  const rendered = await getRenderedArticle(article, mode);
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
      <SiteHeader activeSection={mode} />
      <div className="docs-layout">
        <ArticleNavigationView articleKey={article.articleKey} mode={mode} navigation={navigation} />

        <main className="article-column">
          <article className="markdown-body" data-article-key={article.articleKey} data-content-revision={rendered.contentRevision} dangerouslySetInnerHTML={{ __html: rendered.html }} />
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
                  sections={rendered.sections}
                />
              </div>
            </>
          ) : null}
          <ArticleNeighborsView mode={mode} {...neighbors} />
        </main>

        <ArticleTableOfContents articleKey={article.articleKey} items={tableOfContents} />
      </div>
    </>
  );
}
