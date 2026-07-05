# Frontend Structure

This document describes the folder layout and import conventions for `uae-sales-web`.

## Top-Level Layout

```
uae-sales-web/
├── app/                    # Next.js App Router (routes only)
├── features/               # Domain feature modules
├── shared/                 # Cross-feature UI and utilities
├── services/               # Data access and API layer
├── types/                  # TypeScript domain models
├── public/                 # Static assets
└── *.md                    # Project documentation
```

## App Router (`app/`)

Routes are thin orchestration layers. They fetch data from services and compose feature + shared components.

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/categories`, `/categories/[slug]` | Category directory and listings |
| `/search` | Marketplace search |
| `/listings/[slug]` | Listing detail |
| `/listings/new` | Add listing (auth-gated) |
| `/listings/local/[id]` | User-created local listings |
| `/login`, `/register`, `/forgot-password` | Authentication |
| `/profile` | User profile |
| `/dashboard/listings` | Seller dashboard |
| `/wallet`, `/escrow`, `/checkout`, `/chat` | Placeholders (Coming Soon) |

### Route Conventions

Each major route includes:

- `page.tsx` — Server Component entry point
- `loading.tsx` — Skeleton UI (where applicable)
- `error.tsx` — Route-scoped error boundary (search, categories, listings)

Global files: `app/layout.tsx`, `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`, `app/global-error.tsx`.

## Features (`features/`)

Each feature module follows this structure:

```
features/<domain>/
├── index.ts              # Public barrel exports
└── components/
    └── *.tsx             # Domain components
```

### Feature Modules

| Module | Key Components |
|--------|----------------|
| `auth/` | `LoginForm`, `RegisterForm`, `OtpVerification`, `AuthShell` |
| `categories/` | `CategoryDirectory` |
| `dashboard/` | `DashboardShell`, `MyListingsDashboard` |
| `home/` | `SearchHero`, `CategoriesGrid`, `FeaturedListings`, etc. |
| `listings/` | `ListingCard`, `ListingGallery`, `AddListingForm`, `SellerPanel` |
| `profile/` | `ProfileForm` |
| `search/` | `SearchFilters`, `SearchResultsList` |

### Listings Sub-Module

`AddListingForm` is split into focused pieces:

```
features/listings/components/add-listing/
├── types.ts
├── utils.ts
├── useAddListingForm.ts
├── AddListingStepProgress.tsx
├── CategorySelectionStep.tsx
├── ListingDetailsStep.tsx
├── MediaContactStep.tsx
└── ListingPreviewPanel.tsx
```

## Shared (`shared/`)

```
shared/
├── ui/                   # Design system primitives (Button, Card, Input, …)
├── components/           # Composed shared components (ErrorState, AppImage, …)
├── layouts/              # SiteHeader, SiteFooter
├── hooks/                # useAsyncAction, useMarketplaceSearch, useOnlineStatus
└── constants/            # navigation, locations, listingStatuses
```

### Import Aliases

All imports use the `@/` path alias:

```ts
import { Button } from "@/shared/ui/Button";
import { ListingCard } from "@/features/listings";
import { getListings } from "@/services/listings";
import type { Listing } from "@/types";
```

**Do not** import from deprecated paths (`@/components/`, `@/layouts/`, `@/hooks/`, `@/constants/`).

## Services (`services/`)

```
services/
├── api/                  # HTTP client, ApiError, getErrorMessage
├── auth/                 # Login OTP, registration drafts
├── categories/           # Category queries
├── listings/             # Listing CRUD and search
├── profile/              # User profile
├── content/              # Marketing/homepage content
├── storage/              # localStorage session + local listings
├── data/                 # Mock seed data (internal only)
└── *.ts                  # Legacy re-export shims
```

**Rule:** Components import from `@/services/<domain>`, never from `@/services/data/`.

## Types (`types/`)

```
types/
├── index.ts              # Barrel export (use this for imports)
├── api.ts                # ServiceResult, PaginatedResult, ApiErrorCode
├── marketplace.ts        # Backward-compat re-export
└── domain/
    ├── listing.ts
    ├── category.ts
    ├── user.ts
    ├── location.ts
    └── content.ts
```

## Component Size Guidelines

- **Page files:** &lt; 60 lines — delegate to features.
- **Feature components:** &lt; 200 lines — extract sub-components or hooks.
- **Hooks:** Single responsibility (form state, async actions, search).

## Adding a New Feature

1. Create `features/<name>/components/`.
2. Add service module under `services/<name>/`.
3. Define domain types in `types/domain/`.
4. Create route under `app/<route>/` with `page.tsx`, `loading.tsx`, `error.tsx`.
5. Export public API from `features/<name>/index.ts`.

## Adding a New Page

```tsx
// app/example/page.tsx
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { getExampleData } from "@/services/example";

export default async function ExamplePage() {
  const data = await getExampleData();

  return (
    <>
      <SiteHeader />
      <main>
        {/* feature components */}
      </main>
      <SiteFooter />
    </>
  );
}
```
