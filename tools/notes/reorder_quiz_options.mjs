import { readFile, writeFile } from "node:fs/promises";

const [file, order] = process.argv.slice(2);

if (!file || !order) {
  throw new Error(
    "用法：node tools/notes/reorder_quiz_options.mjs <quiz.json> <a,b,c,d,...>",
  );
}

const questions = JSON.parse(await readFile(file, "utf8"));
const targets = order.split(",");
const optionIds = ["a", "b", "c", "d"];

if (!Array.isArray(questions) || questions.length !== targets.length) {
  throw new Error("目标答案数量必须与题目数量相同");
}

for (const [index, question] of questions.entries()) {
  const target = targets[index];
  const ids = question.options.map((option) => option.id);

  if (ids.join(",") !== optionIds.join(",")) {
    throw new Error(`第 ${index + 1} 题的选项必须依次使用 a、b、c、d`);
  }
  if (!optionIds.includes(target)) {
    throw new Error(`第 ${index + 1} 题的目标答案无效：${target}`);
  }

  const current = question.correctOptionId;
  if (current === target) {
    continue;
  }

  const currentOption = question.options.find((option) => option.id === current);
  const targetOption = question.options.find((option) => option.id === target);

  [currentOption.text, targetOption.text] = [targetOption.text, currentOption.text];
  question.correctOptionId = target;
}

const lines = ["["];

for (const [index, question] of questions.entries()) {
  lines.push("  {");
  lines.push(`    "id": ${JSON.stringify(question.id)},`);
  lines.push(`    "prompt": ${JSON.stringify(question.prompt)},`);
  lines.push('    "options": [');

  for (const [optionIndex, option] of question.options.entries()) {
    const comma = optionIndex + 1 === question.options.length ? "" : ",";
    const id = JSON.stringify(option.id);
    const optionText = JSON.stringify(option.text);
    lines.push(`      { "id": ${id}, "text": ${optionText} }${comma}`);
  }

  lines.push("    ],");
  const correctOptionId = JSON.stringify(question.correctOptionId);
  lines.push(`    "correctOptionId": ${correctOptionId},`);
  lines.push(`    "explanation": ${JSON.stringify(question.explanation)}`);
  lines.push(index + 1 === questions.length ? "  }" : "  },");
}

lines.push("]", "");
await writeFile(file, lines.join("\n"));
