import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  marketplaceListings,
  marketplaceUserListings,
} from "@/mock/listings.mock";
import { getDurableAuthDir } from "@/services/auth/user-persistence";
import { getOptionalPostgresPool } from "@/services/db/postgres";
import type { Listing } from "@/types";

const TABLE = "marketplace_listings";
const FILE = "sooqna-listings.json";

let postgresReady = false;

export async function ensureListingsTable(): Promise<boolean> {
  const pool = await getOptionalPostgresPool();
  if (!pool) return false;
  if (postgresReady) return true;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      seller_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      status TEXT NOT NULL,
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      posted_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      payload JSONB NOT NULL
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS marketplace_listings_status_idx ON ${TABLE} (status)`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS marketplace_listings_seller_idx ON ${TABLE} (seller_id)`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS marketplace_listings_category_idx ON ${TABLE} (category_id)`,
  );
  postgresReady = true;
  return true;
}

function seedListings(): Listing[] {
  const byId = new Map<string, Listing>();
  for (const listing of [...marketplaceListings, ...marketplaceUserListings]) {
    byId.set(listing.id, { ...listing });
  }
  const seeded = Array.from(byId.values());
  for (const listing of seeded.slice(0, 3)) {
    listing.status = "pending_review";
  }
  return seeded;
}

function filePath(): string {
  return path.join(getDurableAuthDir(), FILE);
}

async function readJsonFile(): Promise<Listing[] | null> {
  try {
    const raw = await readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Listing[]) : null;
  } catch {
    return null;
  }
}

async function writeJsonFile(listings: Listing[]): Promise<void> {
  const target = filePath();
  await mkdir(path.dirname(target), { recursive: true });
  const payload = JSON.stringify(listings, null, 2);
  const tempPath = `${target}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, payload, "utf8");
  await rename(tempPath, target);
}

export async function persistAllListings(listings: Listing[]): Promise<void> {
  if (await ensureListingsTable()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) throw new Error("LISTINGS_STORE_UNAVAILABLE");

    // Upsert each row; delete removed ids in a second pass for admin deletes.
    const ids = listings.map((item) => item.id);
    for (const listing of listings) {
      await pool.query(
        `INSERT INTO ${TABLE} (
          id, slug, seller_id, category_id, status, is_featured,
          posted_at, expires_at, updated_at, payload
        ) VALUES (
          $1,$2,$3,$4,$5,$6,
          $7::timestamptz,$8::timestamptz,NOW(),$9::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          seller_id = EXCLUDED.seller_id,
          category_id = EXCLUDED.category_id,
          status = EXCLUDED.status,
          is_featured = EXCLUDED.is_featured,
          posted_at = EXCLUDED.posted_at,
          expires_at = EXCLUDED.expires_at,
          updated_at = NOW(),
          payload = EXCLUDED.payload`,
        [
          listing.id,
          listing.slug,
          listing.seller.id,
          listing.categoryId,
          listing.status,
          Boolean(listing.isFeatured),
          listing.postedAt ?? null,
          listing.expiresAt ?? null,
          JSON.stringify(listing),
        ],
      );
    }

    if (ids.length > 0) {
      await pool.query(
        `DELETE FROM ${TABLE} WHERE NOT (id = ANY($1::text[]))`,
        [ids],
      );
    } else {
      await pool.query(`DELETE FROM ${TABLE}`);
    }
    return;
  }

  await writeJsonFile(listings);
}

export async function loadPersistedListings(): Promise<Listing[]> {
  if (await ensureListingsTable()) {
    const pool = await getOptionalPostgresPool();
    if (!pool) return seedListings();
    const result = await pool.query(
      `SELECT payload FROM ${TABLE} ORDER BY COALESCE(posted_at, updated_at) DESC`,
    );
    if (result.rows.length === 0) {
      const seeded = seedListings();
      await persistAllListings(seeded);
      return seeded;
    }
    return result.rows.map((row) => row.payload as Listing);
  }

  const stored = await readJsonFile();
  if (!stored || stored.length === 0) {
    const seeded = seedListings();
    await writeJsonFile(seeded);
    return seeded;
  }
  return stored;
}

export { seedListings };
