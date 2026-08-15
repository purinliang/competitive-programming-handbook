import manifest from "../.content-cache/interaction-manifest.json";

interface ManifestSection {
  id: string;
  legacyIds: string[];
  quotedText: string;
  revision: string;
  title: string;
}

interface ManifestQuestion {
  correctOptionId: string;
  id: string;
  optionIds: string[];
  revision: string;
}

interface ManifestDocument {
  contentRevision: string;
  documentEpoch: number;
  questions?: ManifestQuestion[];
  sections: ManifestSection[];
}

const documents = manifest.documents as Record<string, ManifestDocument>;

export function getDocument(documentKey: string) {
  return documents[documentKey];
}

export function getSection(documentKey: string, sectionId: string) {
  return getDocument(documentKey)?.sections.find(
    (section) => section.id === sectionId || section.legacyIds.includes(sectionId),
  );
}

export function getSectionIds(documentKey: string, sectionId: string) {
  const section = getSection(documentKey, sectionId);
  return section ? [section.id, ...section.legacyIds] : [sectionId];
}

export function getQuestion(documentKey: string, questionId: string) {
  return getDocument(documentKey)?.questions?.find((question) => question.id === questionId);
}
