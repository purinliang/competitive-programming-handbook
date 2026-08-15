import manifest from "../.content-cache/interaction-manifest.json";

interface ManifestSection {
  id: string;
  quotedText: string;
  revision: string;
  title: string;
}

interface ManifestQuestion {
  correctOptionId: string;
  id: string;
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
  return getDocument(documentKey)?.sections.find((section) => section.id === sectionId);
}

export function getQuestion(documentKey: string, questionId: string) {
  return getDocument(documentKey)?.questions?.find((question) => question.id === questionId);
}
