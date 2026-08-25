/**
 * Certificates & reports durable store (.data/aep-certificates.json).
 * Uses json-file-store so read-only hosts (Vercel) never 500 Server Components.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type { Certificate, CertificateTemplate, CompletionRecord } from "@/types/certificates";

export interface CertificatesDatabase {
  templates: CertificateTemplate[];
  certificates: Certificate[];
  completions: CompletionRecord[];
  seeded: boolean;
}

function dataFile() {
  return path.join(dataDir(), "aep-certificates.json");
}

function emptyDb(): CertificatesDatabase {
  return {
    templates: [],
    certificates: [],
    completions: [],
    seeded: false,
  };
}

function normalizeDb(raw: Partial<CertificatesDatabase>): CertificatesDatabase {
  return {
    ...emptyDb(),
    ...raw,
    templates: raw.templates ?? [],
    certificates: raw.certificates ?? [],
    completions: raw.completions ?? [],
    seeded: Boolean(raw.seeded),
  };
}

export function ensureCertificatesStore(): CertificatesDatabase {
  const raw = readJsonFile<Partial<CertificatesDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function readCertificatesDb(): CertificatesDatabase {
  return ensureCertificatesStore();
}

export function writeCertificatesDb(
  mutator: (db: CertificatesDatabase) => void,
): CertificatesDatabase {
  const db = ensureCertificatesStore();
  mutator(db);
  writeJsonFile(dataFile(), db);
  return db;
}
