import assert from "node:assert/strict";

import {
  automaticSectionId,
  extractArticleSections,
  extractDocumentEpoch,
  legacySectionId,
  questionRevision,
} from "./content-identity.mjs";

const original = `# Test

## Alpha

alpha body

## Beta

beta body
`;
const inserted = `# Test

## Alpha

alpha body

## Inserted

new body

## Beta

beta body
`;
const changed = original.replace("beta body", "changed beta body");
const originalSections = extractArticleSections(original, "original.md");
const insertedSections = extractArticleSections(inserted, "inserted.md");
const changedSections = extractArticleSections(changed, "changed.md");

for (const sectionId of [automaticSectionId("Alpha"), automaticSectionId("Beta")]) {
  const before = originalSections.find((section) => section.id === sectionId);
  const afterInsert = insertedSections.find((section) => section.id === sectionId);
  assert(before && afterInsert);
  assert.equal(afterInsert.id, before.id);
  assert.equal(afterInsert.revision, before.revision);
}
assert.equal(changedSections[0].revision, originalSections[0].revision);
assert.notEqual(changedSections[1].revision, originalSections[1].revision);
assert.deepEqual(originalSections[0].legacyIds, [legacySectionId("Alpha")]);

const explicitBefore = extractArticleSections(
  "<!-- section-id: stable-name -->\n## Old title\n\nbody\n",
  "explicit-before.md",
);
const explicitAfter = extractArticleSections(
  "<!-- section-id: stable-name -->\n## New title\n\nbody\n",
  "explicit-after.md",
);
assert.equal(explicitBefore[0].id, "stable-name");
assert.equal(explicitAfter[0].id, "stable-name");

assert.throws(
  () => extractArticleSections("## Same\n\na\n\n## Same\n\nb\n", "duplicate.md"),
  /重复二级标题身份/,
);
assert.equal(extractDocumentEpoch("# Test\n", "default.md"), 1);
assert.equal(
  extractDocumentEpoch("<!-- document-epoch: 3 -->\n# Test\n", "epoch.md"),
  3,
);
assert.throws(
  () => extractDocumentEpoch(
    "<!-- document-epoch: 2 -->\n<!-- document-epoch: 3 -->\n",
    "duplicate-epoch.md",
  ),
  /只能声明一次/,
);

const question = {
  correctOptionId: "a",
  explanation: "Because A.",
  id: "example",
  options: [
    { id: "a", text: "A" },
    { id: "b", text: "B" },
    { id: "c", text: "C" },
    { id: "d", text: "D" },
  ],
  prompt: "Choose one.",
};
const revision = questionRevision(question);
assert.equal(questionRevision({ ...question }), revision);
assert.notEqual(questionRevision({ ...question, prompt: "Changed." }), revision);

console.log("内容身份单元测试通过。");
