# Release notes — ATPL PASS v1.2 (Task 018)

## Highlights

- **Versioned Mobile & Integrations API (`/api/v1`)** with OpenAPI 3.1 (`GET /api/v1/openapi`).
- JWT access + refresh tokens, API keys (hashed), OAuth-ready client placeholder.
- Public catalog/blog/announcements/certificate verify with rate limits.
- Webhook infrastructure (outbound HMAC + Zoom inbound).
- Integration catalog (Zoom, SMTP, Stripe, calendars, Slack/Teams, CRM, marketing).
- Background job queue, API/query/config cache with tag invalidation.
- Import/export framework (CSV/JSON + PDF/XLSX placeholders).
- API monitoring logs + Super Admin **API Platform** console.
- SQL twin `016_api_platform.sql`.

## Docs

- `docs/MOBILE_API.md`
- Updated `docs/API_OVERVIEW.md`

## Notes

Mobile native apps are **not** included — backend is ready for future iOS/Android/React Native clients without further architecture changes for core surfaces.
