# SEO Report — UAE Sales

**Date:** July 2026  
**Scope:** Metadata, Open Graph, Twitter cards, robots, sitemap, structured data

## Summary

SEO foundations are in place for production indexing. Public marketplace pages are crawlable; authenticated and admin areas are blocked. Listing and category pages have dynamic metadata and JSON-LD structured data.

## 1. Global Metadata

**File:** `lib/seo/metadata.ts` → applied in `app/layout.tsx`

| Field | Value |
|-------|-------|
| Title template | `%s \| UAE Sales` |
| Default title | `UAE Sales \| السوق الإماراتي الفاخر` |
| Description | Arabic marketplace description with escrow/wallet trust signals |
| `metadataBase` | `NEXT_PUBLIC_APP_URL` |
| Keywords | إعلانات الإمارات, سوق إماراتي, بيع وشراء, ضمان مالي, etc. |
| Open Graph | `website`, `ar_AE` locale, site name, title, description |
| Twitter Card | `summary_large_image` |
| Robots | `index: true`, `follow: true` |

## 2. Page-Level Metadata

### Listings (`/listings/[slug]`)

**Function:** `buildListingMetadata()`

- Dynamic title from listing title
- Description truncated to 160 chars
- Canonical URL: `{APP_URL}/listings/{slug}`
- Open Graph with listing image when available
- Twitter card: `summary_large_image` when image exists

### Categories (`/categories/[slug]`)

**Function:** `buildCategoryMetadata()`

- Dynamic title from category name
- Arabic description with category name
- Canonical URL: `{APP_URL}/categories/{slug}`
- Open Graph and Twitter metadata

## 3. Structured Data (JSON-LD)

**Files:** `lib/seo/structured-data.ts`, `shared/components/JsonLd.tsx`

| Page | Schema Type | Fields |
|------|-------------|--------|
| Root layout | `Organization` | name, url, logo |
| Listing detail | `Product` | name, description, image, Offer (price, currency, url) |
| Category page | `CollectionPage` | name, url, description |

### Example — Listing Product schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "عنوان الإعلان",
  "description": "...",
  "image": ["https://..."],
  "offers": {
    "@type": "Offer",
    "price": 50000,
    "priceCurrency": "AED",
    "availability": "https://schema.org/InStock",
    "url": "https://your-domain.com/listings/slug"
  }
}
```

## 4. robots.txt

**File:** `app/robots.ts`

| Rule | Path |
|------|------|
| Allow | `/` (all public pages) |
| Disallow | `/admin`, `/api/`, `/dashboard/`, `/profile`, `/wallet`, `/orders`, `/chat`, `/notifications`, `/checkout` |
| Sitemap | `{APP_URL}/sitemap.xml` |

## 5. Sitemap

**File:** `app/sitemap.ts`

### Included routes

**Static:** `/`, `/categories`, `/search`, `/featured`, `/escrow`, `/login`, `/register`, legal pages (`/terms`, `/privacy`, `/escrow-policy`, `/refund-policy`, `/contact`, `/safety`), `/support`

**Dynamic:**
- All categories: `/categories/{slug}` (priority 0.8, daily)
- Top 200 listings: `/listings/{slug}` (priority 0.6, daily)

### Not included (intentionally)

- Authenticated routes (dashboard, profile, wallet, orders, chat)
- Admin routes
- Edit/create listing routes

## 6. Legal / Trust Pages (indexable)

| Route | Purpose |
|-------|---------|
| `/terms` | Terms of service (placeholder) |
| `/privacy` | Privacy policy (placeholder) |
| `/escrow-policy` | Escrow policy (placeholder) |
| `/refund-policy` | Refund policy (placeholder) |
| `/contact` | Contact page |
| `/safety` | Safety tips |

Footer links added in `shared/constants/navigation.ts`.

## 7. Image SEO

- Listing OG images use `listing.imageUrl` when available
- `next.config.ts` allows `images.unsplash.com` for demo images
- **Action required:** Add production CDN hostname to `remotePatterns` before launch

## 8. RTL & Locale

- `<html lang="ar" dir="rtl">` set in root layout
- OG locale: `ar_AE`
- Content is Arabic-first with optional English descriptions on listings

## 9. Recommendations (Phase 2)

| Item | Priority | Notes |
|------|----------|-------|
| Add `WebSite` schema with `SearchAction` | Medium | Enables sitelinks search box |
| Dynamic OG image generation | Medium | Branded preview cards per listing |
| `hreflang` for English version | Low | If bilingual site launched |
| Increase sitemap listing limit | Low | Paginate or use sitemap index for 1000+ listings |
| Google Search Console setup | High | Submit sitemap after deploy |
| Bing Webmaster Tools | Medium | Submit sitemap |

## 10. Validation Checklist

- [ ] View page source on listing — JSON-LD `Product` present
- [ ] View page source on category — JSON-LD `CollectionPage` present
- [ ] View page source on homepage — JSON-LD `Organization` present
- [ ] `curl {APP_URL}/robots.txt` returns expected rules
- [ ] `curl {APP_URL}/sitemap.xml` returns valid XML
- [ ] Facebook Sharing Debugger shows correct OG tags
- [ ] Twitter Card Validator shows correct card
- [ ] Google Rich Results Test passes for listing page

## Conclusion

SEO basics meet acceptance criteria: metadata, Open Graph, Twitter cards, robots.txt, sitemap.xml, and listing/category structured data are implemented. Submit sitemap to search consoles after production deploy and replace placeholder legal content.
