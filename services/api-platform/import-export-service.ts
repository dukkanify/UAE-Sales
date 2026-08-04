/**
 * Import / export framework (CSV/JSON; PDF/XLSX placeholders).
 */

import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

import { generateId } from "@/lib/security/crypto";
import { enqueueJob } from "@/services/api-platform/queue-service";
import { ensureApiPlatformSeeded } from "@/services/api-platform/seed";
import {
  ensureApiPlatformStore,
  writeApiPlatformStore,
} from "@/services/api-platform/store";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { listCourses } from "@/services/courses/course-service";
import { ApiError } from "@/lib/api/envelope";
import type { ExportFormat, ImportExportKind } from "@/types/api-platform";
import { ROLES } from "@/constants/roles";

function listUsers() {
  return readAuthDb().users.map(toUserProfile);
}

const EXPORT_DIR = path.join(process.cwd(), "public", "exports");

function ensureExportDir() {
  if (!existsSync(EXPORT_DIR)) mkdirSync(EXPORT_DIR, { recursive: true });
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]!);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      headers
        .map((h) => {
          const v = row[h];
          const s = v == null ? "" : String(v);
          return `"${s.replaceAll('"', '""')}"`;
        })
        .join(","),
    );
  }
  return lines.join("\n");
}

export function listImportJobs() {
  ensureApiPlatformSeeded();
  return ensureApiPlatformStore().importJobs;
}

export function listExportJobs() {
  ensureApiPlatformSeeded();
  return ensureApiPlatformStore().exportJobs;
}

export function startImport(input: {
  kind: ImportExportKind;
  filename: string;
  rows: Array<Record<string, unknown>>;
  createdBy?: string | null;
}) {
  ensureApiPlatformSeeded();
  const errors: string[] = [];
  let success = 0;
  for (let i = 0; i < input.rows.length; i++) {
    const row = input.rows[i]!;
    if (input.kind === "students" || input.kind === "instructors") {
      if (!row.email) {
        errors.push(`Row ${i + 1}: email required`);
        continue;
      }
      success += 1;
    } else if (input.kind === "courses") {
      if (!row.title && !row.code) {
        errors.push(`Row ${i + 1}: title or code required`);
        continue;
      }
      success += 1;
    } else if (input.kind === "questions") {
      if (!row.prompt && !row.question) {
        errors.push(`Row ${i + 1}: question text required`);
        continue;
      }
      success += 1;
    } else {
      success += 1;
    }
  }

  const job = {
    id: generateId(),
    kind: input.kind,
    status: "completed" as const,
    filename: input.filename,
    rowCount: input.rows.length,
    successCount: success,
    errorCount: errors.length,
    errors: errors.slice(0, 50),
    createdBy: input.createdBy ?? null,
    createdAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
  };
  const db = ensureApiPlatformStore();
  db.importJobs.unshift(job);
  writeApiPlatformStore(db);
  enqueueJob({ type: "import", payload: { jobId: job.id, kind: input.kind } });
  return job;
}

export function startExport(input: {
  kind: ImportExportKind | "reports" | "users" | "analytics";
  format: ExportFormat;
  createdBy?: string | null;
}) {
  ensureApiPlatformSeeded();
  ensureExportDir();

  if (input.format === "pdf" || input.format === "xlsx") {
    // Placeholder binary formats — emit JSON sidecar noting format readiness.
  }

  let rows: Record<string, unknown>[] = [];
  if (input.kind === "students") {
    rows = listUsers()
      .filter((u) => u.role === ROLES.STUDENT)
      .map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        status: u.status,
      }));
  } else if (input.kind === "instructors") {
    rows = listUsers()
      .filter((u) => u.role === ROLES.INSTRUCTOR)
      .map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        status: u.status,
      }));
  } else if (input.kind === "courses") {
    rows = listCourses({ pageSize: 500 }).data.map((c) => ({
      id: c.id,
      title: c.title,
      code: c.code,
      status: c.status,
    }));
  } else if (input.kind === "users") {
    rows = listUsers().map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
    }));
  } else {
    rows = [{ note: `Export kind ${input.kind} scaffold`, at: new Date().toISOString() }];
  }

  const id = generateId();
  let body = "";
  let ext = "json";
  if (input.format === "csv") {
    body = toCsv(rows);
    ext = "csv";
  } else if (input.format === "json") {
    body = JSON.stringify({ kind: input.kind, rows }, null, 2);
    ext = "json";
  } else if (input.format === "xlsx" || input.format === "pdf") {
    body = JSON.stringify({
      kind: input.kind,
      format: input.format,
      note: `${input.format.toUpperCase()} renderer reserved for production worker`,
      rows,
    }, null, 2);
    ext = `${input.format}.json`;
  } else {
    throw new ApiError(400, "invalid_format", "Unsupported export format");
  }

  const filename = `${input.kind}-${id}.${ext}`;
  const abs = path.join(EXPORT_DIR, filename);
  writeFileSync(abs, body, "utf8");

  const job = {
    id,
    kind: input.kind,
    format: input.format,
    status: "completed" as const,
    downloadPath: `/exports/${filename}`,
    createdBy: input.createdBy ?? null,
    createdAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
  };
  const db = ensureApiPlatformStore();
  db.exportJobs.unshift(job);
  writeApiPlatformStore(db);
  enqueueJob({ type: "export", payload: { jobId: job.id } });
  return job;
}
