/**
 * Backup & restore for JSON data stores + config snapshot.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  statSync,
  rmSync,
} from "fs";
import path from "path";
import { createHash } from "crypto";

import { generateId } from "@/lib/security/crypto";
import { writeOpsLog } from "@/services/ops/logging-service";

export type BackupRetention = "daily" | "weekly" | "monthly";

export interface BackupManifest {
  id: string;
  retention: BackupRetention;
  createdAt: string;
  files: Array<{ name: string; bytes: number; sha256: string }>;
  notes: string;
  restoreTestedAt: string | null;
}

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, ".data");
const BACKUP_ROOT = path.join(ROOT, ".backups");
const UPLOADS_DIR = path.join(ROOT, "public", "uploads");

function ensureDirs() {
  if (!existsSync(BACKUP_ROOT)) mkdirSync(BACKUP_ROOT, { recursive: true });
}

function hashFile(filePath: string): string {
  const buf = readFileSync(filePath);
  return createHash("sha256").update(buf).digest("hex");
}

export function listBackups(): BackupManifest[] {
  ensureDirs();
  if (!existsSync(BACKUP_ROOT)) return [];
  return readdirSync(BACKUP_ROOT)
    .filter((d) => existsSync(path.join(BACKUP_ROOT, d, "manifest.json")))
    .map((d) => {
      const raw = JSON.parse(
        readFileSync(path.join(BACKUP_ROOT, d, "manifest.json"), "utf8"),
      ) as BackupManifest;
      return raw;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createBackup(input?: {
  retention?: BackupRetention;
  notes?: string;
}): BackupManifest {
  ensureDirs();
  const retention = input?.retention ?? "daily";
  const id = `${new Date().toISOString().replace(/[:.]/g, "-")}-${retention}-${generateId().slice(0, 8)}`;
  const dest = path.join(BACKUP_ROOT, id);
  mkdirSync(dest, { recursive: true });
  mkdirSync(path.join(dest, "data"), { recursive: true });
  mkdirSync(path.join(dest, "uploads"), { recursive: true });
  mkdirSync(path.join(dest, "config"), { recursive: true });

  const files: BackupManifest["files"] = [];

  if (existsSync(DATA_DIR)) {
    for (const name of readdirSync(DATA_DIR)) {
      if (!name.endsWith(".json")) continue;
      const src = path.join(DATA_DIR, name);
      if (!statSync(src).isFile()) continue;
      const target = path.join(dest, "data", name);
      copyFileSync(src, target);
      files.push({ name: `data/${name}`, bytes: statSync(target).size, sha256: hashFile(target) });
    }
  }

  if (existsSync(UPLOADS_DIR)) {
    const walk = (dir: string, rel: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, entry.name);
        const r = path.join(rel, entry.name);
        if (entry.isDirectory()) {
          mkdirSync(path.join(dest, "uploads", r), { recursive: true });
          walk(abs, r);
        } else {
          const target = path.join(dest, "uploads", r);
          mkdirSync(path.dirname(target), { recursive: true });
          copyFileSync(abs, target);
          files.push({
            name: `uploads/${r}`,
            bytes: statSync(target).size,
            sha256: hashFile(target),
          });
        }
      }
    };
    walk(UPLOADS_DIR, "");
  }

  // Config snapshot (no secrets)
  const configSnap = {
    appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
    appName: process.env.NEXT_PUBLIC_APP_NAME ?? "ATPL PASS",
    supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    zoomConfigured: Boolean(process.env.ZOOM_CLIENT_ID),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    createdAt: new Date().toISOString(),
  };
  const configPath = path.join(dest, "config", "snapshot.json");
  writeFileSync(configPath, JSON.stringify(configSnap, null, 2), "utf8");
  files.push({
    name: "config/snapshot.json",
    bytes: statSync(configPath).size,
    sha256: hashFile(configPath),
  });

  const manifest: BackupManifest = {
    id,
    retention,
    createdAt: new Date().toISOString(),
    files,
    notes: input?.notes ?? "Automated platform backup",
    restoreTestedAt: null,
  };
  writeFileSync(path.join(dest, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  pruneRetention(retention);
  writeOpsLog({
    level: "info",
    category: "backup",
    message: `Backup created ${id} (${files.length} files)`,
    details: { retention, bytes: files.reduce((s, f) => s + f.bytes, 0) },
  });

  return manifest;
}

function pruneRetention(retention: BackupRetention) {
  const keep =
    retention === "daily" ? 14 : retention === "weekly" ? 8 : retention === "monthly" ? 12 : 14;
  const ofType = listBackups().filter((b) => b.retention === retention);
  for (const stale of ofType.slice(keep)) {
    const dir = path.join(BACKUP_ROOT, stale.id);
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  }
}

/** Dry-run restore verification — validates hashes without overwriting live data. */
export function testRestore(backupId: string): {
  ok: boolean;
  checked: number;
  failures: string[];
} {
  const dir = path.join(BACKUP_ROOT, backupId);
  const manifestPath = path.join(dir, "manifest.json");
  if (!existsSync(manifestPath)) {
    return { ok: false, checked: 0, failures: ["Backup not found"] };
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as BackupManifest;
  const failures: string[] = [];
  for (const file of manifest.files) {
    const abs = path.join(dir, file.name);
    if (!existsSync(abs)) {
      failures.push(`Missing ${file.name}`);
      continue;
    }
    const hash = hashFile(abs);
    if (hash !== file.sha256) failures.push(`Hash mismatch ${file.name}`);
  }

  if (!failures.length) {
    manifest.restoreTestedAt = new Date().toISOString();
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  }

  writeOpsLog({
    level: failures.length ? "error" : "info",
    category: "backup",
    message: `Restore test ${backupId}: ${failures.length ? "FAILED" : "OK"}`,
    details: { failures },
  });

  return { ok: failures.length === 0, checked: manifest.files.length, failures };
}

/** Restore data JSON from a backup (destructive to .data). Uploads optional. */
export function restoreBackup(backupId: string, opts?: { includeUploads?: boolean }): {
  ok: boolean;
  restored: string[];
} {
  const dir = path.join(BACKUP_ROOT, backupId);
  if (!existsSync(path.join(dir, "manifest.json"))) {
    throw new Error("Backup not found");
  }
  const test = testRestore(backupId);
  if (!test.ok) throw new Error(`Backup integrity failed: ${test.failures.join(", ")}`);

  const restored: string[] = [];
  const dataSrc = path.join(dir, "data");
  if (existsSync(dataSrc)) {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    for (const name of readdirSync(dataSrc)) {
      copyFileSync(path.join(dataSrc, name), path.join(DATA_DIR, name));
      restored.push(`data/${name}`);
    }
  }

  if (opts?.includeUploads) {
    const upSrc = path.join(dir, "uploads");
    if (existsSync(upSrc)) {
      if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
      const walk = (from: string, to: string) => {
        for (const entry of readdirSync(from, { withFileTypes: true })) {
          const f = path.join(from, entry.name);
          const t = path.join(to, entry.name);
          if (entry.isDirectory()) {
            mkdirSync(t, { recursive: true });
            walk(f, t);
          } else {
            mkdirSync(path.dirname(t), { recursive: true });
            copyFileSync(f, t);
            restored.push(`uploads/${path.relative(upSrc, f)}`);
          }
        }
      };
      walk(upSrc, UPLOADS_DIR);
    }
  }

  writeOpsLog({
    level: "warn",
    category: "backup",
    message: `Restored backup ${backupId}`,
    details: { restored: restored.length },
  });

  return { ok: true, restored };
}
