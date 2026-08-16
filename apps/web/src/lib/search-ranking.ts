export interface SearchRecord {
  articleKey: string;
  bodyText?: string;
  headingText?: string;
  moduleTitle: string;
  route: string;
  status: string;
  text?: string;
  title: string;
}

interface RankedSearchRecord {
  abbreviationMatch: boolean;
  exactTitle: boolean;
  headingMatches: number;
  headingOccurrences: number;
  moduleMatches: number;
  record: SearchRecord;
  sourceIndex: number;
  textOccurrences: number;
  titleMatches: number;
  titleOccurrences: number;
}

interface SearchTerm {
  loosePattern?: RegExp;
  value: string;
}

export const NORMAL_QUERY_DELAY_MS = 250;
export const SHORT_QUERY_DELAY_MS = 500;

function normalizeSearchText(text: string): string {
  return text.toLocaleLowerCase("zh-CN");
}

function compactSearchText(text: string): string {
  return normalizeSearchText(text).replace(/\s+/gu, "");
}

function escapeRegularExpressionCharacter(character: string): string {
  return character.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function createSearchTerm(value: string): SearchTerm {
  const normalized = normalizeSearchText(value);
  const characters = [...normalized];
  const containsAscii = /[a-z0-9]/u.test(normalized);
  const containsNonAscii = /[^\x00-\x7f]/u.test(normalized);
  if (!containsAscii || !containsNonAscii || characters.length === 0) {
    return { value: normalized };
  }

  const startsWithAscii = /^[a-z0-9]/u.test(characters[0]);
  const endsWithAscii = /[a-z0-9]$/u.test(characters.at(-1) ?? "");
  const body = characters
    .map(escapeRegularExpressionCharacter)
    .join("\\s*");
  return {
    loosePattern: new RegExp(
      `${startsWithAscii ? "(^|[^a-z0-9])" : ""}${body}${
        endsWithAscii ? "(?=$|[^a-z0-9])" : ""
      }`,
      "gu",
    ),
    value: normalized,
  };
}

function countOccurrences(text: string, term: string): number {
  let count = 0;
  let start = 0;

  while (true) {
    const position = text.indexOf(term, start);
    if (position === -1) return count;
    count++;
    start = position + term.length;
  }
}

function countSearchOccurrences(text: string, term: SearchTerm): number {
  return term.loosePattern
    ? [...text.matchAll(term.loosePattern)].length
    : countOccurrences(text, term.value);
}

function containsIndependentAbbreviation(
  text: string,
  abbreviation: string,
): boolean {
  return new RegExp(
    `(^|[^A-Za-z0-9])${abbreviation}(?=$|[^A-Za-z0-9])`,
    "u",
  ).test(text);
}

function rank(
  record: SearchRecord,
  terms: SearchTerm[],
  sourceIndex: number,
  abbreviation?: string,
): RankedSearchRecord | null {
  const title = normalizeSearchText(record.title);
  const headingText = normalizeSearchText(record.headingText ?? "");
  const bodyText = normalizeSearchText(record.bodyText ?? record.text ?? "");
  const moduleTitle = normalizeSearchText(record.moduleTitle);
  let titleMatches = 0;
  let titleOccurrences = 0;
  let headingMatches = 0;
  let headingOccurrences = 0;
  let moduleMatches = 0;
  let bodyOccurrences = 0;

  for (const term of terms) {
    const titleCount = countSearchOccurrences(title, term);
    const headingCount = countSearchOccurrences(headingText, term);
    const bodyCount = countSearchOccurrences(bodyText, term);
    const moduleCount = countSearchOccurrences(moduleTitle, term);
    if (titleCount === 0 && headingCount === 0 && bodyCount < 2) return null;
    if (titleCount > 0) titleMatches++;
    if (headingCount > 0) headingMatches++;
    if (moduleCount > 0) moduleMatches++;
    titleOccurrences += titleCount;
    headingOccurrences += headingCount;
    bodyOccurrences += bodyCount;
  }

  const abbreviationMatch = abbreviation
    ? containsIndependentAbbreviation(record.title, abbreviation)
      || containsIndependentAbbreviation(record.headingText ?? "", abbreviation)
      || containsIndependentAbbreviation(record.moduleTitle, abbreviation)
    : false;

  return {
    abbreviationMatch,
    exactTitle: compactSearchText(record.title) === terms
      .map((term) => term.value)
      .join(""),
    headingMatches,
    headingOccurrences,
    moduleMatches,
    record,
    sourceIndex,
    textOccurrences: bodyOccurrences,
    titleMatches,
    titleOccurrences,
  };
}

export function getSearchDelay(query: string): number {
  const normalized = query.trim();
  if (!normalized) return 0;
  if (/[\u3400-\u9fff]/u.test(normalized)) return NORMAL_QUERY_DELAY_MS;
  const asciiCount = normalized.match(/[a-z0-9]/giu)?.length ?? 0;
  return asciiCount >= 3 ? NORMAL_QUERY_DELAY_MS : SHORT_QUERY_DELAY_MS;
}

export function isSearchableQuery(query: string): boolean {
  const normalized = query.trim();
  return /[\u3400-\u9fff]/u.test(normalized)
    || (normalized.match(/[a-z0-9]/giu)?.length ?? 0) > 0;
}

export function rankSearchRecords(
  records: SearchRecord[],
  query: string,
  limit = 20,
): { records: SearchRecord[]; total: number } {
  const normalizedQuery = query.trim();
  const terms = normalizedQuery
    .split(/\s+/)
    .map(createSearchTerm)
    .filter((term) => term.value.length > 0);
  if (!isSearchableQuery(normalizedQuery) || terms.length === 0) {
    return { records: [], total: 0 };
  }

  const abbreviation = /^[a-z]{1,2}$/iu.test(normalizedQuery)
    ? normalizedQuery.toLocaleUpperCase("en-US")
    : undefined;
  const ranked = records
    .map((record, sourceIndex) => rank(
      record,
      terms,
      sourceIndex,
      abbreviation,
    ))
    .filter((item): item is RankedSearchRecord => item !== null)
    .sort((left, right) => (
      Number(right.abbreviationMatch) - Number(left.abbreviationMatch)
      || Number(right.exactTitle) - Number(left.exactTitle)
      || right.titleMatches - left.titleMatches
      || right.titleOccurrences - left.titleOccurrences
      || right.headingMatches - left.headingMatches
      || right.headingOccurrences - left.headingOccurrences
      || right.moduleMatches - left.moduleMatches
      || right.textOccurrences - left.textOccurrences
      || left.sourceIndex - right.sourceIndex
    ));

  return {
    records: ranked.slice(0, limit).map((item) => item.record),
    total: ranked.length,
  };
}
