/** Shared Arabic-aware search text helpers for marketplace queries. */

const DIACRITICS_RE = /[\u064B-\u065F\u0670]/g;

/**
 * Normalize Arabic/Latin search text so common spelling variants match
 * (ة/ه، أ/إ/آ، ى/ي) and diacritics are ignored.
 */
export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(DIACRITICS_RE, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "")
    .replace(/\s+/g, " ");
}

/** Loose stems for Arabic plurals / feminine endings so سياره ≈ سيارات. */
function arabicStems(token: string): string[] {
  const stems = new Set<string>([token]);
  if (token.length < 3) return [token];

  for (const suffix of ["ات", "ون", "ين", "ان", "ه", "ي"] as const) {
    if (token.endsWith(suffix) && token.length - suffix.length >= 3) {
      stems.add(token.slice(0, -suffix.length));
    }
  }

  return Array.from(stems);
}

function tokenize(value: string): string[] {
  return value.split(/[^\p{L}\p{N}]+/u).filter((token) => token.length > 0);
}

/**
 * Returns true when `query` meaningfully appears in `haystack`
 * after Arabic normalization and light stemming.
 */
export function searchTextMatches(haystack: string, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const normalizedHaystack = normalizeSearchText(haystack);
  if (normalizedHaystack.includes(normalizedQuery)) return true;

  if (normalizedQuery.length < 3) return false;

  const queryStems = arabicStems(normalizedQuery).filter((stem) => stem.length >= 3);
  const haystackTokens = tokenize(normalizedHaystack);

  for (const token of haystackTokens) {
    if (token.length < 3) continue;
    if (token.includes(normalizedQuery)) return true;

    // Progressive typing: سيار → سيارات / سيارة
    if (
      token.startsWith(normalizedQuery) ||
      (normalizedQuery.startsWith(token) && token.length >= 4)
    ) {
      return true;
    }

    const tokenStems = arabicStems(token).filter((stem) => stem.length >= 3);
    if (queryStems.some((stem) => tokenStems.includes(stem))) {
      return true;
    }
  }

  return false;
}

/** Category keyword aliases so generic queries like «سياره» find the cars vertical. */
export const CATEGORY_SEARCH_KEYWORDS: Record<string, string[]> = {
  cars: [
    "سياره",
    "سيارة",
    "سيارات",
    "مركبه",
    "مركبة",
    "مركبات",
    "car",
    "cars",
    "auto",
    "vehicle",
  ],
  "real-estate": ["عقار", "عقارات", "شقه", "شقة", "فيلا", "property", "villa", "apartment"],
  electronics: ["الكترونيات", "إلكترونيات", "electronics", "لابتوب", "laptop"],
  mobiles: ["جوال", "موبايل", "هاتف", "ايفون", "آيفون", "phone", "mobile", "iphone"],
  furniture: ["اثاث", "أثاث", "furniture", "منزل"],
  jobs: ["وظيفه", "وظيفة", "وظائف", "job", "jobs", "توظيف"],
  fashion: ["ازياء", "أزياء", "ملابس", "fashion"],
  kids: ["اطفال", "أطفال", "kids", "baby"],
  sports: ["رياضه", "رياضة", "sports"],
  books: ["كتب", "كتاب", "books"],
  food: ["طعام", "مأكولات", "food"],
};
