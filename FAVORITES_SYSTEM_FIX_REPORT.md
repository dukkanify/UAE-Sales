# Favorites System Fix Report

## Root Cause

Multiple issues caused broken favorites behavior and contributed to React #185:

1. **Unstable `useSyncExternalStore` snapshots** — `getFavorites()` returned new array references every render
2. **Client-trusted `userId`** — APIs previously accepted user ID from client body/query
3. **`syncFavoritesAfterLogin` loops** — repeated sync could re-trigger storage events and re-renders
4. **Missing session cookies** on favorites API calls

## Solution

- Stable `getFavoritesSnapshot()` with cache invalidation on writes
- Favorites APIs resolve identity from `sooqna_session` cookie only (`requireSessionUser`)
- Client uses `credentials: "include"` for all favorites requests
- Optimistic toggle with rollback on API failure
- Sync runs once per user ID with in-flight guard
- Heart icon: outline `heart` / filled `heart-filled` with brand accent
- Arabic toasts for add/remove/error

## Files Changed

| File | Change |
|------|--------|
| `services/storage/external-store.ts` | Stable favorites snapshot |
| `services/storage/client-storage.ts` | Snapshot invalidation |
| `services/favorites/favorites-client.ts` | Session cookies, sync guard |
| `services/favorites/favorites-sync.ts` | Optimistic toggle + rollback |
| `app/api/favorites/route.ts` | Session-based GET/POST/sync |
| `app/api/favorites/[id]/route.ts` | Session-based DELETE |
| `services/auth/require-session.ts` | **New** — cookie session helper |
| `shared/components/FavoriteButton.tsx` | Stable store, heart states, login redirect |
| `features/profile/components/FavoritesPanel.tsx` | Uses `useFavoritesList` |

## APIs Changed

| Endpoint | Auth | Notes |
|----------|------|-------|
| `GET /api/favorites` | Session cookie | Returns user favorites |
| `POST /api/favorites` | Session cookie | Add favorite or `sync: true` bulk merge |
| `DELETE /api/favorites/[id]` | Session cookie | Remove by listing ID |

Client `userId` is no longer accepted or trusted.

## Environment Variables

None specific to favorites (uses existing `SESSION_COOKIE_DOMAIN` for cross-subdomain cookies).

## Tests Performed

- Logged-out click → `/login?next={listingUrl}`
- Logged-in toggle → immediate UI + persist on refresh
- API failure → optimistic rollback + error toast
- Post-login sync → dedupe + single run
- Favorites panel reflects same state

## Remaining Risks

- Local-only listings (`local-*` IDs) sync to server; server must handle ID collisions if catalog IDs overlap
- No server-side favorites hydration on anonymous browse (by design — login required)
