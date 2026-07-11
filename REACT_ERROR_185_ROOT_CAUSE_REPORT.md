# React Error #185 — Root Cause Report

## Root Cause

React minified error **#185** maps to **"Maximum update depth exceeded"** — an infinite re-render loop caused by unstable `useSyncExternalStore` snapshots.

`FavoriteButton`, `useFavoritesList`, and `CheckoutWizard` subscribed to session/favorites via `useSyncExternalStore`. Their `getSnapshot` functions called:

- `getFavorites()` → `JSON.parse(localStorage)` on every call, returning a **new array reference** each time
- `getSessionUser()` → `JSON.parse(localStorage)` on every call, returning a **new object reference** each time

React compares snapshots with `Object.is`. When the snapshot reference changes on every read—even when underlying data is unchanged—React schedules another render, which reads the snapshot again, which changes again → infinite loop.

## Fix

Introduced stable snapshot caching in `services/storage/external-store.ts`:

- `getFavoritesSnapshot()` and `getSessionSnapshot()` cache parsed values keyed by raw `localStorage` string
- Return the **same object/array reference** until storage actually changes
- `invalidateFavoritesSnapshot()` / `invalidateSessionSnapshot()` called on every write in `client-storage.ts`

Updated consumers:

- `FavoriteButton` / `useFavoritesList` → `subscribeFavorites` + `getFavoritesSnapshot`
- `CheckoutWizard` → `subscribeSession` + `getSessionSnapshot`
- `favorites-sync.ts` / `favorites-client.ts` → snapshot helpers + one-time sync guard

## Files Changed

| File | Change |
|------|--------|
| `services/storage/external-store.ts` | **New** — stable snapshot cache + subscribe helpers |
| `services/storage/client-storage.ts` | Invalidate snapshots on session/favorites writes |
| `shared/components/FavoriteButton.tsx` | Stable favorites/session snapshots |
| `services/favorites/favorites-sync.ts` | Use `getFavoritesSnapshot` for optimistic updates |
| `services/favorites/favorites-client.ts` | Sync guard (`lastSyncedUserId`, `syncInFlight`) |
| `features/checkout/components/CheckoutWizard.tsx` | Stable session snapshot |
| `shared/components/RouteErrorFallback.tsx` | **New** — Arabic error UX, retry limit, error ref ID |
| `app/error.tsx`, `app/listings/[slug]/error.tsx`, `app/categories/error.tsx`, `app/search/error.tsx` | Use `RouteErrorFallback` |
| `shared/components/ErrorState.tsx` | Support children (home button slot) |

## APIs Changed

None — this was a client-side React subscription issue.

## Environment Variables

None required for this fix.

## Tests Performed

- `npm run lint` — pass
- `npm run build` — pass
- Manual flow review: listing detail favorite toggle, login redirect + sync, checkout wizard session read, error boundary retry (max 1)

## Remaining Risks

- Components that still call `getSessionUser()` directly (headers, modals) use `useState` + event listeners rather than `useSyncExternalStore` — safe today but should migrate to snapshots if converted to external store subscriptions
- `getLocalListings()` still returns new arrays per call; not currently used in `useSyncExternalStore` subscribe loops
