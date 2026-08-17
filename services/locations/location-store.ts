import { cities } from "@/shared/constants/locations";
import { loadCollection, saveCollection } from "@/services/payments/data-store";
import type {
  LocationCreateInput,
  LocationPatch,
  LocationRecord,
} from "@/types/domain/location";

const FILE = "locations.json";

let cacheRows: LocationRecord[] | null = null;
let inflight: Promise<LocationRecord[]> | null = null;

function seedLocations(): LocationRecord[] {
  return cities.map((city, index) => ({
    id: city.id,
    name: city.name,
    emirate: city.name,
    enabled: true,
    sortOrder: index + 1,
  }));
}

function cloneLocations(rows: LocationRecord[]) {
  return rows.map((row) => ({ ...row }));
}

function setCache(rows: LocationRecord[]) {
  cacheRows = cloneLocations(rows);
  return cacheRows;
}

async function loadLocationRecordsUncached(): Promise<LocationRecord[]> {
  if (cacheRows) return cloneLocations(cacheRows);

  if (!inflight) {
    inflight = (async () => {
      const stored = await loadCollection<LocationRecord>(FILE).catch(
        () => [] as LocationRecord[],
      );
      if (stored.length === 0) {
        const seeded = seedLocations();
        await saveCollection(FILE, seeded);
        return setCache(seeded);
      }
      return setCache(stored);
    })().finally(() => {
      inflight = null;
    });
  }

  return cloneLocations(await inflight);
}

export async function getLocations(options?: {
  enabledOnly?: boolean;
}): Promise<LocationRecord[]> {
  const rows = await loadLocationRecordsUncached();
  const filtered = options?.enabledOnly
    ? rows.filter((row) => row.enabled)
    : rows;
  return filtered.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "ar"));
}

export async function createLocation(
  input: LocationCreateInput,
): Promise<LocationRecord> {
  const rows = await loadLocationRecordsUncached();
  const maxOrder = rows.reduce((max, row) => Math.max(max, row.sortOrder), 0);
  const record: LocationRecord = {
    id: `loc-${Date.now()}`,
    name: input.name.trim(),
    emirate: input.emirate?.trim() || undefined,
    enabled: input.enabled ?? true,
    sortOrder: input.sortOrder ?? maxOrder + 1,
  };
  rows.push(record);
  await saveCollection(FILE, rows);
  setCache(rows);
  return { ...record };
}

export async function patchLocation(
  id: string,
  patch: LocationPatch,
): Promise<LocationRecord | undefined> {
  const rows = await loadLocationRecordsUncached();
  const index = rows.findIndex((row) => row.id === id);
  if (index < 0) return undefined;
  rows[index] = {
    ...rows[index],
    ...patch,
    name: patch.name?.trim() ?? rows[index].name,
    emirate:
      patch.emirate !== undefined
        ? patch.emirate.trim() || undefined
        : rows[index].emirate,
  };
  await saveCollection(FILE, rows);
  setCache(rows);
  return { ...rows[index] };
}

export async function deleteLocation(id: string): Promise<boolean> {
  const rows = await loadLocationRecordsUncached();
  const next = rows.filter((row) => row.id !== id);
  if (next.length === rows.length) return false;
  await saveCollection(FILE, next);
  setCache(next);
  return true;
}
