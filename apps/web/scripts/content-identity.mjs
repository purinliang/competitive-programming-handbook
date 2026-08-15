import { createHash } from "node:crypto";

import GithubSlugger from "github-slugger";
import remarkParse from "remark-parse";
import { unified } from "unified";

export function hashRevision(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function markdownText(node) {
  if (typeof node.value === "string") {
    return node.value;
  }
  return (node.children ?? []).map(markdownText).join("");
}

export function automaticSectionId(title) {
  const slug = new GithubSlugger().slug(title);
  return slug ? `section-${slug}` : `section-${hashRevision(title)}`;
}

export function legacySectionId(title) {
  return `section-${hashRevision(title)}`;
}

export function extractDocumentEpoch(markdown, sourcePath) {
  const matches = [...markdown.matchAll(/<!--\s*document-epoch:\s*(\d+)\s*-->/g)];
  if (matches.length > 1) {
    throw new Error(`${sourcePath} 只能声明一次 document-epoch`);
  }
  if (matches.length === 0) return 1;
  const epoch = Number(matches[0][1]);
  if (!Number.isSafeInteger(epoch) || epoch < 1) {
    throw new Error(`${sourcePath} 的 document-epoch 必须是正整数`);
  }
  return epoch;
}

export function extractArticleSections(markdown, sourcePath) {
  const tree = unified().use(remarkParse).parse(markdown);
  const headings = [];

  for (let index = 0; index < tree.children.length; index += 1) {
    const node = tree.children[index];
    if (node.type !== "heading" || node.depth !== 2) {
      continue;
    }

    const previous = tree.children[index - 1];
    const explicitMatch = previous?.type === "html"
      ? previous.value.match(/^<!--\s*section-id:\s*([a-z0-9]+(?:-[a-z0-9]+)*)\s*-->$/)
      : undefined;
    const title = markdownText(node).trim();
    const id = explicitMatch?.[1] ?? automaticSectionId(title);
    const oldId = legacySectionId(title);
    headings.push({
      declarationStart: explicitMatch ? previous.position.start.offset : node.position.start.offset,
      explicit: Boolean(explicitMatch),
      headingStart: node.position.start.offset,
      id,
      legacyIds: explicitMatch || oldId === id ? [] : [oldId],
      title,
    });
  }

  const ids = new Set();
  return headings.map((heading, index) => {
    if (ids.has(heading.id)) {
      throw new Error(`${sourcePath} 包含重复二级标题身份 ${heading.id}，请使用显式 section-id`);
    }
    ids.add(heading.id);
    const end = headings[index + 1]?.declarationStart ?? markdown.length;
    const source = markdown.slice(heading.headingStart, end).trim();
    return {
      explicit: heading.explicit,
      id: heading.id,
      legacyIds: heading.legacyIds,
      revision: hashRevision(source),
      title: heading.title,
      quotedText: source
        .replace(/[`*_>#|$\\]/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 240)
        .trim(),
    };
  });
}

export function questionRevision(question) {
  return hashRevision(JSON.stringify({
    correctOptionId: question.correctOptionId,
    explanation: question.explanation,
    id: question.id,
    options: question.options,
    prompt: question.prompt,
  }));
}
