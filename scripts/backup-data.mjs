/**
 * CLI backup entry — `node scripts/backup-data.mjs [daily|weekly|monthly]`
 * Prefer `npm run backup` which uses the TypeScript service via next/tsx if available;
 * this script mirrors the same layout for cron without compiling.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  writeFileSync,
  statSync,
  readFileSync,
} from "fs";
import path from "path";
import { createHash, randomBytes } from "crypto";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, ".data");
const BACKUP_ROOT = path.join(ROOT, ".backups");
const UPLOADS = path.join(ROOT, "public", "uploads");
const retention = process.argv[2] || "daily";

function hash(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function main() {
  if (!existsSync(BACKUP_ROOT)) mkdirSync(BACKUP_ROOT, { recursive: true });
  const id = `${new Date().toISOString().replace(/[:.]/g, "-")}-${retention}-${randomBytes(4).toString("hex")}`;
  const dest = path.join(BACKUP_ROOT, id);
  mkdirSync(path.join(dest, "data"), { recursive: true });
  mkdirSync(path.join(dest, "uploads"), { recursive: true });
  mkdirSync(path.join(dest, "config"), { recursive: true });

  const files = [];
  if (existsSync(DATA_DIR)) {
    for (const name of readdirSync(DATA_DIR)) {
      if (!name.endsWith(".json")) continue;
      const src = path.join(DATA_DIR, name);
      if (!statSync(src).isFile()) continue;
      const target = path.join(dest, "data", name);
      copyFileSync(src, target);
      files.push({ name: `data/${name}`, bytes: statSync(target).size, sha256: hash(target) });
    }
  }

  writeFileSync(
    path.join(dest, "config", "snapshot.json"),
    JSON.stringify(
      {
        appEnv: process.env.NEXT_PUBLIC_APP_ENV || "development",
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  const manifest = {
    id,
    retention,
    createdAt: new Date().toISOString(),
    files,
    notes: "CLI backup-data.mjs",
    restoreTestedAt: null,
  };
  writeFileSync(path.join(dest, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`Backup created: ${id} (${files.length} data files)`);
  if (existsSync(UPLOADS)) {
    console.log("Note: uploads directory present — use ops API backup for full uploads copy.");
  }
}

main();
