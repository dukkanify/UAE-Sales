import { loadCollection, saveCollection } from "@/services/payments/data-store";

export type StripeConnectOnboardingStatus =
  | "NOT_CONNECTED"
  | "SETUP_REQUIRED"
  | "UNDER_VERIFICATION"
  | "REQUIREMENTS_DUE"
  | "ACTIVE"
  | "RESTRICTED";

export type StripeConnectAccountRecord = {
  ownerUserId: string;
  stripeAccountId: string;
  stripeOnboardingStatus: StripeConnectOnboardingStatus;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeDetailsSubmitted: boolean;
  stripeRequirementsStatus: string;
  stripeDisabledReason: string | null;
  stripeConnectedAt: string;
  stripeUpdatedAt: string;
  /** Last known currently_due / past_due codes for debugging — never KYC docs. */
  outstandingRequirements: string[];
};

type PostgresPool = {
  query: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: Record<string, unknown>[] }>;
};

const FILE_NAME = "stripe-connect-accounts.json";
const TABLE = "stripe_connect_accounts";

let pool: PostgresPool | null = null;
let tableReady = false;

function getPostgresUrl(): string {
  const direct =
    process.env.DATABASE_URL?.trim() ||
    process.env.DATABASE_URL_UNPOOLED?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    "";
  if (direct.startsWith("postgres")) return direct;

  const host =
    process.env.DATABASE_PGHOST?.trim() ||
    process.env.DATABASE_PGHOST_UNPOOLED?.trim() ||
    process.env.PGHOST?.trim() ||
    "";
  const user =
    process.env.DATABASE_PGUSER?.trim() ||
    process.env.PGUSER?.trim() ||
    "neondb_owner";
  const password =
    process.env.DATABASE_PGPASSWORD?.trim() ||
    process.env.PGPASSWORD?.trim() ||
    "";
  const database =
    process.env.DATABASE_PGDATABASE?.trim() ||
    process.env.PGDATABASE?.trim() ||
    "neondb";
  const port =
    process.env.DATABASE_PGPORT?.trim() || process.env.PGPORT?.trim() || "5432";

  if (host && password) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}?sslmode=require`;
  }
  return "";
}

function shouldUseSsl(connectionString: string): boolean {
  if (/localhost|127\.0\.0\.1/i.test(connectionString)) return false;
  if (/sslmode=disable/i.test(connectionString)) return false;
  return (
    process.env.NODE_ENV === "production" ||
    /sslmode=require/i.test(connectionString) ||
    /neon\.tech|supabase\.co|amazonaws\.com/i.test(connectionString)
  );
}

async function getPool(): Promise<PostgresPool | null> {
  const connectionString = getPostgresUrl();
  if (!connectionString) return null;
  if (pool && tableReady) return pool;
  const pg = await import("pg");
  const created = new pg.Pool({
    connectionString,
    max: 3,
    ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  });
  pool = {
    query: (sql, params) => created.query(sql, params),
  };
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      owner_user_id TEXT PRIMARY KEY,
      stripe_account_id TEXT NOT NULL UNIQUE,
      stripe_onboarding_status TEXT NOT NULL,
      stripe_charges_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      stripe_payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      stripe_details_submitted BOOLEAN NOT NULL DEFAULT FALSE,
      stripe_requirements_status TEXT NOT NULL DEFAULT '',
      stripe_disabled_reason TEXT,
      stripe_connected_at TIMESTAMPTZ NOT NULL,
      stripe_updated_at TIMESTAMPTZ NOT NULL,
      outstanding_requirements JSONB NOT NULL DEFAULT '[]'::jsonb
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_stripe_connect_account_id ON ${TABLE} (stripe_account_id)`,
  );
  tableReady = true;
  return pool;
}

function rowToRecord(row: Record<string, unknown>): StripeConnectAccountRecord {
  const outstanding = row.outstanding_requirements;
  let outstandingRequirements: string[] = [];
  if (Array.isArray(outstanding)) {
    outstandingRequirements = outstanding.filter(
      (item): item is string => typeof item === "string",
    );
  } else if (typeof outstanding === "string") {
    try {
      const parsed = JSON.parse(outstanding) as unknown;
      if (Array.isArray(parsed)) {
        outstandingRequirements = parsed.filter(
          (item): item is string => typeof item === "string",
        );
      }
    } catch {
      outstandingRequirements = [];
    }
  }

  return {
    ownerUserId: String(row.owner_user_id),
    stripeAccountId: String(row.stripe_account_id),
    stripeOnboardingStatus: String(
      row.stripe_onboarding_status,
    ) as StripeConnectOnboardingStatus,
    stripeChargesEnabled: Boolean(row.stripe_charges_enabled),
    stripePayoutsEnabled: Boolean(row.stripe_payouts_enabled),
    stripeDetailsSubmitted: Boolean(row.stripe_details_submitted),
    stripeRequirementsStatus: String(row.stripe_requirements_status ?? ""),
    stripeDisabledReason:
      typeof row.stripe_disabled_reason === "string"
        ? row.stripe_disabled_reason
        : null,
    stripeConnectedAt:
      row.stripe_connected_at instanceof Date
        ? row.stripe_connected_at.toISOString()
        : String(row.stripe_connected_at),
    stripeUpdatedAt:
      row.stripe_updated_at instanceof Date
        ? row.stripe_updated_at.toISOString()
        : String(row.stripe_updated_at),
    outstandingRequirements,
  };
}

export async function getConnectAccountByOwner(
  ownerUserId: string,
): Promise<StripeConnectAccountRecord | null> {
  const pg = await getPool();
  if (pg) {
    const result = await pg.query(
      `SELECT * FROM ${TABLE} WHERE owner_user_id = $1 LIMIT 1`,
      [ownerUserId],
    );
    const row = result.rows[0];
    return row ? rowToRecord(row) : null;
  }

  const all = await loadCollection<StripeConnectAccountRecord>(FILE_NAME);
  return all.find((item) => item.ownerUserId === ownerUserId) ?? null;
}

export async function getConnectAccountByStripeId(
  stripeAccountId: string,
): Promise<StripeConnectAccountRecord | null> {
  const pg = await getPool();
  if (pg) {
    const result = await pg.query(
      `SELECT * FROM ${TABLE} WHERE stripe_account_id = $1 LIMIT 1`,
      [stripeAccountId],
    );
    const row = result.rows[0];
    return row ? rowToRecord(row) : null;
  }

  const all = await loadCollection<StripeConnectAccountRecord>(FILE_NAME);
  return all.find((item) => item.stripeAccountId === stripeAccountId) ?? null;
}

export async function upsertConnectAccount(
  record: StripeConnectAccountRecord,
): Promise<StripeConnectAccountRecord> {
  const pg = await getPool();
  if (pg) {
    await pg.query(
      `INSERT INTO ${TABLE} (
        owner_user_id,
        stripe_account_id,
        stripe_onboarding_status,
        stripe_charges_enabled,
        stripe_payouts_enabled,
        stripe_details_submitted,
        stripe_requirements_status,
        stripe_disabled_reason,
        stripe_connected_at,
        stripe_updated_at,
        outstanding_requirements
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz, $10::timestamptz, $11::jsonb
      )
      ON CONFLICT (owner_user_id) DO UPDATE SET
        stripe_account_id = EXCLUDED.stripe_account_id,
        stripe_onboarding_status = EXCLUDED.stripe_onboarding_status,
        stripe_charges_enabled = EXCLUDED.stripe_charges_enabled,
        stripe_payouts_enabled = EXCLUDED.stripe_payouts_enabled,
        stripe_details_submitted = EXCLUDED.stripe_details_submitted,
        stripe_requirements_status = EXCLUDED.stripe_requirements_status,
        stripe_disabled_reason = EXCLUDED.stripe_disabled_reason,
        stripe_connected_at = EXCLUDED.stripe_connected_at,
        stripe_updated_at = EXCLUDED.stripe_updated_at,
        outstanding_requirements = EXCLUDED.outstanding_requirements`,
      [
        record.ownerUserId,
        record.stripeAccountId,
        record.stripeOnboardingStatus,
        record.stripeChargesEnabled,
        record.stripePayoutsEnabled,
        record.stripeDetailsSubmitted,
        record.stripeRequirementsStatus,
        record.stripeDisabledReason,
        record.stripeConnectedAt,
        record.stripeUpdatedAt,
        JSON.stringify(record.outstandingRequirements),
      ],
    );
    return record;
  }

  const all = await loadCollection<StripeConnectAccountRecord>(FILE_NAME);
  const index = all.findIndex((item) => item.ownerUserId === record.ownerUserId);
  if (index >= 0) {
    all[index] = record;
  } else {
    all.unshift(record);
  }
  await saveCollection(FILE_NAME, all);
  return record;
}
