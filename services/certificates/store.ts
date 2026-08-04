/**
 * Certificates & reports durable store (.data/aep-certificates.json).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

import type {
  Certificate,
  CertificateTemplate,
  CompletionRecord,
} from "@/types/certificates";

export interface CertificatesDatabase {
  templates: CertificateTemplate[];
  certificates: Certificate[];
  completions: CompletionRecord[];
  seeded: boolean;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-certificates.json");

function emptyDb(): CertificatesDatabase {
  return {
    templates: [],
    certificates: [],
    completions: [],
    seeded: false,
  };
}

export function ensureCertificatesStore(): CertificatesDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as CertificatesDatabase;
    return {
      templates: raw.templates ?? [],
      certificates: raw.certificates ?? [],
      completions: raw.completions ?? [],
      seeded: Boolean(raw.seeded),
    };
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function readCertificatesDb(): CertificatesDatabase {
  return ensureCertificatesStore();
}

export function writeCertificatesDb(
  mutator: (db: CertificatesDatabase) => void,
): CertificatesDatabase {
  const db = ensureCertificatesStore();
  mutator(db);
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  return db;
}
