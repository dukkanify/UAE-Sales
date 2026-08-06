# Brand assets & client resources — Task 026

**Product:** AviatorPass  
**Branch tip:** `cursor/aep-brand-assets-0987`  
**Policy:** Integrate official branding and prepare for pending brand guidelines — **no architecture redesign**.

## Company information (configured)

| Field            | Value                                                       |
| ---------------- | ----------------------------------------------------------- |
| Platform name    | AviatorPass                                                 |
| Language         | English only                                                |
| Official email   | ME@ABDULAZIZALSHOAIL.COM                                    |
| Locations        | Kuwait · Dubai                                              |
| Social           | @ABDULAZIZ_ALSHOAIL                                         |
| Meta description | Professional Aviation Education Platform for ATPL Training. |

Sources of truth:

- Static defaults: `config/site.ts`, `config/branding.ts`
- Runtime (Super Admin editable): Platform Settings → General / Branding
- Public snapshot: `GET /api/public/brand`

## Logo & brand masters

| Location                    | Purpose                                       |
| --------------------------- | --------------------------------------------- |
| `public/brand/*.svg`        | Current web logo / favicon / OG placeholders  |
| `public/brand/source/`      | Drop AI / SVG / PDF / PNG masters (no code)   |
| Settings → Branding uploads | Runtime replacements under `uploads/branding` |

Chrome (`BrandLogo`) reads runtime URLs via `BrandProvider` → `/api/public/brand`, falling back to `siteConfig`.

## Pending brand assets (no code change when delivered)

Toggle / edit in Super Admin → Branding (and `config/branding.ts` pending flags):

- Brand guidelines
- Official color palette
- Official typography
- Brand style guide

Update colors/fonts in settings or `config/theme.ts` when the client delivers them.

## Commercial license

- Super Admin: `/super-admin/licenses` or Asset Manager → Commercial license
- API: `/api/admin/licenses` (PDF only, version history, preview iframe, download)
- Storage: `public/uploads/licenses/` (gitignored)

## Aviation media library

- Super Admin: `/super-admin/media-library` or Asset Manager → Media library
- Categories in `constants/media-library.ts` (extend without schema redesign)
- API: `/api/admin/media-library`
- Storage: `public/uploads/media-library/`
- UI uses `OptimizedImage` (lazy load, alt text, SEO fields)

## Asset manager

Unified panel: `/super-admin/assets` — brand logos overview, media library, license vault, email/SEO summary.

## Email branding

`services/settings/email-templates.ts` → `renderBrandedEmail` includes logo, company name, official email, brand colors, locations, social links, footer.

## SEO

Root `app/layout.tsx` metadata uses AviatorPass + English + OG image from `siteConfig` / brand assets. Favicon from `/brand/favicon.svg` (replaceable via settings upload).
