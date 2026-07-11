# Sooqna — Upload Report

**Date:** 2026-07-08  
**Branch:** `cursor/dynamic-listing-system-37ba`

---

## 1. Current Flow (Demo Mode)

```
File input → blob preview (session) → uploadListingImages() → persistImageFiles()
  → JPEG compress (max 960px, q=0.72) → data URL → localStorage
```

- No `blob:` URLs persisted after publish
- Images survive refresh and navigation
- Up to 6 images per listing

---

## 2. Production Abstraction

**`services/upload/upload.service.ts`**

```ts
export async function uploadListingImages(files: File[]): Promise<string[]>
```

| Mode | Trigger | Behavior |
|------|---------|----------|
| Demo (default) | No `NEXT_PUBLIC_UPLOAD_PROVIDER` | `persistImageFiles()` → data URLs |
| Production hook | `cloudinary` / `s3` / `supabase` | Logs warning + falls back until API wired |

Swap implementation in one file when backend is ready — no form changes needed.

---

## 3. Image Display

`AppImage` uses native `<img>` for `data:` and `blob:` sources (preview + persisted).

Catalog images continue using `next/image` + Unsplash remote patterns.

---

## 4. Files

| File | Role |
|------|------|
| `shared/utils/persist-images.ts` | Canvas compression → data URL |
| `services/upload/upload.service.ts` | Abstract upload entry |
| `services/upload/index.ts` | Export |
| `useAddListingForm.ts` | Calls `uploadListingImages()` |
| `shared/components/AppImage.tsx` | Inline image support |

---

## 5. Limits & Risks

| Item | Detail |
|------|--------|
| localStorage quota | Large albums may hit ~5MB browser limit |
| No CDN in demo | Acceptable for mock; production uses provider |
| Edit flow | Local edit does not yet re-upload images |

---

## 6. Acceptance

| Criterion | Status |
|-----------|--------|
| No blob URLs after publish | ✅ |
| Images persist after refresh | ✅ |
| Production abstraction ready | ✅ |
| Compress before save | ✅ |

---

*Upload system — demo-safe with production provider hook.*
