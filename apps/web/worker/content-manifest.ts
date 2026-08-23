import { readPublishedJson } from "./content-store";

import type { WorkerBindings } from "./env";

interface ContentObject {
  bytes: number;
  contentHash: string;
  objectPath: string;
}

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
  articleKey: string;
  contentRevision: string;
  documentEpoch: number;
  questions?: ManifestQuestion[];
  sections: ManifestSection[];
}

interface ManifestDocumentSummary extends ContentObject {
  articleKey: string;
  contentRevision: string;
  documentEpoch: number;
  questions: ManifestQuestion[];
}

interface InteractionManifest {
  documents: Record<string, ManifestDocumentSummary>;
  version: 1;
}

interface ContentRelease {
  interactionManifest: ContentObject;
  releaseId: string;
  version: 1;
}

const immutableCache = new Map<string, Promise<unknown>>();
let releaseCache:
  | { expiresAt: number; promise: Promise<ContentRelease> }
  | undefined;

function verifiedObjectPath(object: ContentObject) {
  if (!object.objectPath.includes(object.contentHash)) {
    throw new Error("交互定义没有通过完整性检查");
  }
  return object.objectPath;
}

function readImmutable<T>(env: WorkerBindings, object: ContentObject) {
  const objectPath = verifiedObjectPath(object);
  let promise = immutableCache.get(objectPath) as Promise<T> | undefined;
  if (!promise) {
    promise = readPublishedJson<T>(env, objectPath).catch((error) => {
      immutableCache.delete(objectPath);
      throw error;
    });
    if (immutableCache.size >= 512) {
      const oldest = immutableCache.keys().next().value;
      if (oldest) immutableCache.delete(oldest);
    }
    immutableCache.set(objectPath, promise);
  }
  return promise;
}

async function getRelease(env: WorkerBindings) {
  const now = Date.now();
  if (!releaseCache || releaseCache.expiresAt <= now) {
    const promise = readPublishedJson<ContentRelease>(
      env,
      "/content/release.json",
    ).catch((error) => {
      releaseCache = undefined;
      throw error;
    });
    releaseCache = { expiresAt: now + 60_000, promise };
  }
  return await releaseCache.promise;
}

async function getManifest(env: WorkerBindings) {
  const release = await getRelease(env);
  return await readImmutable<InteractionManifest>(
    env,
    release.interactionManifest,
  );
}

export async function getDocument(
  env: WorkerBindings,
  documentKey: string,
) {
  const manifest = await getManifest(env);
  const summary = manifest.documents[documentKey];
  if (!summary) return undefined;
  return await readImmutable<ManifestDocument>(env, summary);
}

export async function getDocuments(env: WorkerBindings) {
  return (await getManifest(env)).documents;
}

export function getSection(
  document: ManifestDocument,
  sectionId: string,
) {
  return document.sections.find(
    (section) => (
      section.id === sectionId || section.legacyIds.includes(sectionId)
    ),
  );
}

export function getSectionIds(
  document: ManifestDocument,
  sectionId: string,
) {
  const section = getSection(document, sectionId);
  return section ? [section.id, ...section.legacyIds] : [sectionId];
}

export function getQuestion(
  document: ManifestDocument,
  questionId: string,
) {
  return document.questions?.find((question) => question.id === questionId);
}
