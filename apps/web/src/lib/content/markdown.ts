import "server-only";

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { toText } from "hast-util-to-text";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { NOTES_ROOT } from "./catalog";
import type { ArticleRecord, RenderedArticle, TableOfContentsItem } from "./types";

interface HastNode {
  type: string;
  tagName?: string;
  url?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function walkTree(node: HastNode, visitor: (node: HastNode, parent?: HastNode) => void, parent?: HastNode) {
  visitor(node, parent);
  for (const child of node.children ?? []) {
    walkTree(child, visitor, node);
  }
}

function rewriteUrl(url: string, sourcePath: string): string {
  if (/^(?:[a-z]+:|\/|#)/i.test(url)) {
    return url;
  }

  const [pathname, hash] = url.split("#", 2);
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), pathname));
  const suffix = hash ? `#${hash}` : "";

  if (resolved === "CATALOG.md") {
    return `/catalog/${suffix}`;
  }
  if (resolved === "LEARNING-PATH.md") {
    if (hash === "扩展阅读索引") {
      return "/catalog/";
    }
    return `/learn/${suffix}`;
  }
  if (resolved.startsWith("assets/")) {
    return `/content-assets/${resolved.slice("assets/".length)}${suffix}`;
  }
  if (resolved.endsWith(".md")) {
    return `/${resolved.slice(0, -3)}/${suffix}`;
  }

  return url;
}

function remarkRewriteLinks(sourcePath: string) {
  return () => (tree: HastNode) => {
    walkTree(tree, (node) => {
      if ((node.type === "link" || node.type === "image") && node.url) {
        node.url = rewriteUrl(node.url, sourcePath);
      }
    });
  };
}

function rehypeCollectMetadata(tableOfContents: TableOfContentsItem[]) {
  return () => (tree: HastNode) => {
    let currentSection = "article";
    const occurrences = new Map<string, number>();

    walkTree(tree, (node, parent) => {
      if (node.type !== "element" || !node.tagName) {
        return;
      }

      node.properties ??= {};
      if (node.tagName === "h2" || node.tagName === "h3") {
        const id = String(node.properties.id ?? "");
        const title = toText(node as never);
        if (id) {
          tableOfContents.push({ depth: node.tagName === "h2" ? 2 : 3, id, title });
          currentSection = id;
          node.properties["data-block-key"] = `heading:${id}`;
        }
        return;
      }

      if (!["p", "pre", "table", "blockquote", "li"].includes(node.tagName)) {
        return;
      }
      if (node.tagName === "p" && (parent?.tagName === "blockquote" || parent?.tagName === "li")) {
        return;
      }

      const normalizedText = toText(node as never).replace(/\s+/g, " ").trim();
      if (!normalizedText) {
        return;
      }

      const digest = createHash("sha256").update(normalizedText).digest("hex").slice(0, 12);
      const baseKey = `${currentSection}:${node.tagName}:${digest}`;
      const occurrence = (occurrences.get(baseKey) ?? 0) + 1;
      occurrences.set(baseKey, occurrence);
      node.properties["data-block-key"] = occurrence === 1 ? baseKey : `${baseKey}:${occurrence}`;
    });
  };
}

export async function renderArticle(article: ArticleRecord): Promise<RenderedArticle> {
  const markdown = await readFile(path.join(NOTES_ROOT, article.sourcePath), "utf8");
  const tableOfContents: TableOfContentsItem[] = [];
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRewriteLinks(article.sourcePath))
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeCollectMetadata(tableOfContents))
    .use(rehypeKatex)
    .use(rehypePrettyCode, {
      theme: {
        light: "github-light-default",
        dark: "github-dark-default",
      },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(markdown);

  return {
    html: String(result),
    contentRevision: createHash("sha256").update(markdown).digest("hex").slice(0, 16),
    tableOfContents,
  };
}
