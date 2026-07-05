# Database Schema

**ORM:** Prisma 5  
**Database:** PostgreSQL  
**Schema file:** `prisma/schema.prisma`

## Entity Relationship Overview

```
User ──┬── Seller ── Listing ── ListingImage
       ├── Wallet ── WalletTransaction
       ├── Favorite ── Listing
       ├── Message
       ├── Order ── EscrowTransaction
       │         └── Dispute
       ├── Session
       └── OtpVerification

Category ── Listing
```

## Tables

### Users

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | PK |
| fullName | String | |
| email | String | Unique |
| phone | String | Unique |
| passwordHash | String | bcrypt |
| role | Enum | USER, BUSINESS, ADMIN |
| accountType | Enum | INDIVIDUAL, BUSINESS, BUYER, SELLER, COMPANY |
| emirate | String? | |
| city | String? | |
| verified | Boolean | Default false |
| subscription | String? | e.g. Premium |
| employeesCount | Int? | Business accounts |
| listingsCount | Int? | Profile stat |
| favoritesCount | Int? | Profile stat |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Sellers

| Column | Type | Notes |
|--------|------|-------|
| id | String | PK |
| userId | String? | FK → User (optional) |
| sellerKey | String? | Unique mock key |
| sellerName | String | Arabic display name |
| sellerType | String | individual / business |
| rating | Float | |
| reviewsCount | Int | |
| verified | Boolean | |
| responseTime | String? | |
| completedTransactions | Int | |
| avatarUrl | String? | |
| nameEnglish | String? | |
| joinedAt | DateTime? | |

### Categories

| Column | Type | Notes |
|--------|------|-------|
| id | String | PK (cars, real-estate, etc.) |
| nameArabic | String | |
| nameEnglish | String? | |
| slug | String | Unique |
| icon | String | CategoryIconName |
| image | String? | |
| listingCount | Int | |
| subcategories | Json | string[] |
| featuredListingSlug | String? | |

### Listings

| Column | Type | Notes |
|--------|------|-------|
| id | String | PK |
| sellerId | String | FK → Seller |
| categoryId | String | FK → Category |
| ownerUserId | String? | Dashboard owner |
| titleArabic | String | |
| titleEnglish | String? | |
| slug | String | Unique |
| descriptionArabic | String | |
| descriptionEnglish | String? | |
| price | Float | |
| currency | String | Default AED |
| emirate | String? | |
| city | String? | |
| area | String? | |
| condition | Enum | NEW, USED, EXCELLENT |
| status | Enum | DRAFT, ACTIVE, PENDING_REVIEW, EXPIRED, REJECTED |
| featured | Boolean | |
| premium | Boolean | |
| escrowAvailable | Boolean | |
| views | Int | |
| metadata | Json? | Extended fields (specs, features, etc.) |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### ListingImages

| Column | Type | Notes |
|--------|------|-------|
| id | String | PK |
| listingId | String | FK → Listing |
| url | String | |
| alt | String? | |
| sortOrder | Int | |

### Favorites

| Column | Type | Notes |
|--------|------|-------|
| id | String | PK |
| userId | String | FK → User |
| listingId | String | FK → Listing |
| createdAt | DateTime | Unique(userId, listingId) |

### Messages

| Column | Type | Notes |
|--------|------|-------|
| id | String | PK |
| senderId | String | FK → User |
| receiverId | String | FK → User |
| listingId | String? | FK → Listing |
| message | String | |
| read | Boolean | |
| createdAt | DateTime | |

### Wallets

| Column | Type | Notes |
|--------|------|-------|
| id | String | PK |
| userId | String | FK → User (unique) |
| availableBalance | Float | |
| pendingBalance | Float | |
| currency | String | Default AED |

### WalletTransactions

| Column | Type | Notes |
|--------|------|-------|
| id | String | PK |
| walletId | String | FK → Wallet |
| type | Enum | DEPOSIT, WITHDRAWAL, ESCROW_HOLD, etc. |
| amount | Float | |
| status | Enum | PENDING, COMPLETED, FAILED, CANCELLED |
| description | String? | |
| createdAt | DateTime | |

### Orders

| Column | Type | Notes |
|--------|------|-------|
| id | String | PK |
| buyerId | String | FK → User |
| sellerId | String | FK → User |
| listingId | String | FK → Listing |
| amount | Float | |
| paymentFee | Float | |
| totalAmount | Float | |
| status | Enum | PENDING, PAID, COMPLETED, CANCELLED, DISPUTED |

### EscrowTransactions

| Column | Type | Notes |
|--------|------|-------|
| id | String | PK |
| orderId | String | FK → Order (unique) |
| amount | Float | |
| status | Enum | HELD, RELEASED, REFUNDED, DISPUTED |
| heldAt | DateTime | |
| releasedAt | DateTime? | |
| refundedAt | DateTime? | |

### Disputes

| Column | Type | Notes |
|--------|------|-------|
| id | String | PK |
| orderId | String | FK → Order |
| openedById | String | FK → User |
| reason | String | |
| description | String? | |
| status | Enum | OPEN, UNDER_REVIEW, RESOLVED, CLOSED |

### Sessions (auth)

| Column | Type | Notes |
|--------|------|-------|
| id | String | PK |
| userId | String | FK → User |
| token | String | Unique, httpOnly cookie |
| expiresAt | DateTime | 7 days |

### OtpVerifications (auth)

| Column | Type | Notes |
|--------|------|-------|
| id | String | PK |
| userId | String? | FK → User |
| identifier | String | Email or phone |
| code | String | Demo: 123456 |
| expiresAt | DateTime | 10 minutes |
| verified | Boolean | |

## Metadata JSON (Listings)

Extended frontend fields stored in `Listing.metadata`:

- `subcategory`, `country`, `imageTone`
- `verifiedSeller`, `contactMethod`, `deliveryOption`
- `features`, `negotiable`, `reasonForSelling`
- `carSpecs`, `realEstateSpecs`, `electronicsSpecs`

## Seed Data

`prisma/seed.ts` imports from existing mocks:

- 3 demo users (user, business, admin)
- 10 marketplace sellers
- 13 categories
- ~40 public listings + 5 user dashboard listings
- Wallet balances + sample transactions

Run: `npm run db:seed`
