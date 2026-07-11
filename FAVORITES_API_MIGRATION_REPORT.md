# Favorites API Migration Report

## Summary

Migrated favorites from localStorage-only to API-first persistence with optimistic UI and login sync.

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/favorites?userId=` | GET | List user favorites |
| `/api/favorites` | POST | Add favorite or sync batch (`sync: true`) |
| `/api/favorites/[listingId]?userId=` | DELETE | Remove favorite |

## Storage

`.data/favorites.json` via `services/favorites/favorite-store.ts`

## Client Behavior

1. **Logged-in toggle:** optimistic local update → API POST/DELETE → revert on failure
2. **Login sync:** `syncFavoritesAfterLogin()` merges local favorites into server on login
3. **Hydration:** `FavoriteButton` loads server state on mount for logged-in users
4. **Logged-out:** redirect to `/login?next=...` (unchanged)

## UI Updates

- `shared/components/FavoriteButton.tsx` — API-aware toggle
- `features/profile/components/FavoritesPanel.tsx` — remove action + local listing URLs
- `features/auth/components/LoginForm.tsx` — sync after login

## Files Changed

- `services/favorites/{favorite-store,favorites-client,favorites-sync}.ts`
- `types/domain/server-favorite.ts`
- `app/api/favorites/**`

## Remaining Risks

- API auth uses client-supplied `userId` (consistent with addresses/orders pattern).
- Favorite snapshots (title/price) are not refreshed when listing changes.
