# API Integration Guide

This guide explains how to connect the Sooqna frontend to a real backend API, replacing the current mock service layer.

## Current State

- All data flows through `services/` modules.
- Mock data lives in `services/data/marketplace.mock.ts` (not imported by components).
- `services/api/client.ts` provides a typed `fetch` wrapper but is inactive until `NEXT_PUBLIC_API_BASE_URL` is set.
- User session and locally created listings use `localStorage` via `services/storage/`.

## Environment Setup

Add to `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.sooqna.ae/v1
```

When unset, domain services continue using mock data. When set, services should call `apiClient` instead of mock imports.

## API Client

Location: `services/api/client.ts`

```ts
import { apiClient } from "@/services/api";

const listings = await apiClient<Listing[]>("/listings");
```

### Error Handling

```ts
import { ApiError, getErrorMessage, isApiError } from "@/services/api";

try {
  await apiClient("/listings", { method: "POST", body: JSON.stringify(payload) });
} catch (error) {
  if (isApiError(error)) {
    // error.code: "NOT_FOUND" | "UNAUTHORIZED" | "NETWORK_ERROR" | ...
    console.error(error.code, error.message);
  }
  const message = getErrorMessage(error); // safe for UI display
}
```

`ApiError` maps HTTP status codes:

| Status | Code |
|--------|------|
| 400 | `BAD_REQUEST` |
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` |
| 422 | `VALIDATION_ERROR` |
| 500+ | `SERVER_ERROR` |

## Service Migration Pattern

Replace mock imports with API calls behind the same function signature.

### Before (mock)

```ts
// services/listings/listings.service.ts
import { mockListings } from "@/services/data";

export async function getListings(): Promise<Listing[]> {
  return mockListings;
}
```

### After (API)

```ts
import { apiClient, isApiConfigured } from "@/services/api";
import { mockListings } from "@/services/data";

export async function getListings(): Promise<Listing[]> {
  if (!isApiConfigured()) {
    return mockListings;
  }
  return apiClient<Listing[]>("/listings");
}
```

Keep mock fallbacks during development, or remove them once the API is stable.

## Domain Service Endpoints

Suggested REST mapping for each service module:

### Listings (`services/listings/`)

| Function | Method | Endpoint |
|----------|--------|----------|
| `getListings()` | GET | `/listings` |
| `getListingBySlug(slug)` | GET | `/listings/slug/{slug}` |
| `getFeaturedListings()` | GET | `/listings?featured=true` |
| `getLatestListings()` | GET | `/listings?sort=latest&limit=12` |
| `getRelatedListings(categoryId, excludedId)` | GET | `/listings?categoryId={id}&exclude={id}&limit=3` |
| `searchListings(filters)` | GET | `/listings/search?q=&categoryId=&city=&minPrice=&maxPrice=` |
| `getMyListings()` | GET | `/me/listings` |

Local listing creation (`saveLocalListing`) should become:

```
POST /me/listings
Body: CreateListingPayload
Response: Listing
```

### Categories (`services/categories/`)

| Function | Method | Endpoint |
|----------|--------|----------|
| `getCategories()` | GET | `/categories` |
| `getCategoryBySlug(slug)` | GET | `/categories/slug/{slug}` |

### Auth (`services/auth/`)

| Function | Method | Endpoint |
|----------|--------|----------|
| `requestLoginOtp(identifier)` | POST | `/auth/otp/request` |
| `completeLogin(identifier)` | POST | `/auth/otp/verify` |
| `registerUserDraft(user)` | POST | `/auth/register` |

On successful login, store the API token instead of mock user JSON:

```ts
// services/storage/client-storage.ts — extend with:
export function setAuthToken(token: string) { ... }
export function getAuthToken(): string | null { ... }
```

Pass token in `apiClient` headers:

```ts
headers: {
  Authorization: `Bearer ${getAuthToken()}`,
  ...
}
```

### Profile (`services/profile/`)

| Function | Method | Endpoint |
|----------|--------|----------|
| `getCurrentUser()` | GET | `/me` |
| `updateUserProfileDraft(id, payload)` | PATCH | `/me` |

### Content (`services/content/`)

Marketing content (stats, testimonials, trust points) can be served from a CMS:

| Function | Method | Endpoint |
|----------|--------|----------|
| `getHomeStats()` | GET | `/content/home/stats` |
| `getHomeTestimonials()` | GET | `/content/home/testimonials` |
| etc. | GET | `/content/home/{section}` |

## Type Contracts

Domain types in `types/domain/` are the frontend contract. Align backend responses to these shapes:

```ts
// types/domain/listing.ts
export type Listing = {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: string;
  city: string;
  country: string;
  price: number;
  currency: string;
  condition: ListingCondition;
  status: ListingStatus;
  isFeatured: boolean;
  views: number;
  imageUrl?: string;
  seller: ListingSeller;
  imageTone: ListingImageTone;
};
```

For paginated endpoints, use `PaginatedResult<T>` from `types/api.ts`:

```ts
export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
```

## Authentication Flow

Current mock flow:

1. User submits credentials → `requestLoginOtp()`
2. User enters OTP → `completeLogin()` → `setSessionUser()`
3. Protected routes check `getSessionUser()` client-side

Production flow:

1. `POST /auth/otp/request` or `POST /auth/login`
2. `POST /auth/otp/verify` → receive `{ user, accessToken, refreshToken }`
3. Store tokens in `httpOnly` cookies (preferred) or secure storage
4. Server Components fetch user via middleware/session; Client Components use context

Consider adding:

- `middleware.ts` for route protection
- `AuthProvider` context for client-side session
- Server-side session validation in layout or page loaders

## Image Uploads

`AddListingForm` currently stores blob preview URLs locally. For production:

1. `POST /uploads/presign` → receive S3/CDN upload URL
2. Upload file directly to storage
3. Pass returned `imageUrl` in `POST /me/listings`

## Search & Filters

`ListingSearchFilters` type defines the filter contract:

```ts
export type ListingSearchFilters = {
  query?: string;
  categoryId?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ListingCondition;
};
```

Map these to query parameters in `searchListings()`.

## Migration Checklist

- [ ] Set `NEXT_PUBLIC_API_BASE_URL`
- [ ] Implement auth token storage and `apiClient` authorization header
- [ ] Migrate `listings.service.ts` endpoints
- [ ] Migrate `categories.service.ts` endpoints
- [ ] Migrate `auth.service.ts` login/register
- [ ] Migrate `profile.service.ts`
- [ ] Replace `localStorage` listings with API CRUD
- [ ] Migrate `content/` to CMS endpoints
- [ ] Add `middleware.ts` for protected routes
- [ ] Remove mock fallbacks from services (optional)
- [ ] Remove `services/data/` once fully migrated

## Legacy Shim Files

These files re-export the new modules and can be removed after all imports are updated:

- `services/listingsService.ts`
- `services/categoriesService.ts`
- `services/userService.ts`
- `services/authService.ts`
- `services/apiClient.ts`
- `services/clientStorage.ts`

## Testing Integration

1. `npm run build` — ensure no type errors with API response shapes.
2. Test each route with network throttling (slow 3G) to verify loading skeletons.
3. Test offline mode — `OfflineBanner` should appear.
4. Test 404 (`/listings/nonexistent-slug`) and error retry flows.
5. Verify RTL layout and Arabic copy remain correct after data swap.
