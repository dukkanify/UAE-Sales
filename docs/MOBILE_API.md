# Mobile API & integrations — Task 018

Versioned REST API (`/api/v1`) for iOS, Android, React Native, and third-party integrations. **Mobile apps are not built in this task** — only the backend contracts.

## Quick start (mobile)

```http
POST /api/v1/auth/otp/request
{ "email": "student.one@eagerpilots.com", "purpose": "login" }

POST /api/v1/auth/otp/verify
{ "email": "student.one@eagerpilots.com", "token": "123456", "purpose": "login" }
→ { accessToken, refreshToken, tokenType: "Bearer", user }

Authorization: Bearer <accessToken>
GET /api/v1/me
```

Refresh: `POST /api/v1/auth/refresh` `{ "refreshToken" }`  
Revoke: `POST /api/v1/auth/revoke`

## Standards

| Concern | Behavior |
|---------|----------|
| Versioning | `/api/v1/*` (legacy web cookie APIs remain under `/api/*`) |
| Envelope | `{ success, data, error, meta.version }` |
| Auth | Bearer JWT · `x-api-key` · session cookie (web) |
| Pagination | `page`, `pageSize`, `sortBy`, `sortDir`, `q` |
| Rate limits | Public 60/min/IP · Bearer 300/min · API key configurable |
| Errors | `{ code, message, details }` |

## Public APIs (abuse-protected)

- `GET /api/v1/public/courses`
- `GET /api/v1/public/blog`
- `GET /api/v1/public/announcements`
- `GET|POST /api/v1/public/certificates/verify`

## Private mobile APIs

`/me` · `/courses` · `/lessons` · `/classes` · `/calendar` · `/quizzes` · `/certificates` · `/payments` · `/wallets` · `/reports` · `/communities` · `/notifications` · `/support` · `/analytics` · `/ai` · `/users` (admin)

## Platform (Super Admin)

UI: `/super-admin/api-platform`  
Routes under `/api/v1/platform/{keys,webhooks,integrations,queue,import,export,monitoring,cache}`

## Webhooks

Outbound: create endpoints, HMAC `X-AEP-Signature` over `{timestamp}.{body}`  
Events: payment.*, zoom.*, user.registered, course.enrolled, certificate.issued, notification.created, support.ticket.updated, integration.test  

Inbound Zoom: `POST /api/v1/webhooks/inbound/zoom` (optional `ZOOM_WEBHOOK_SECRET`)

## Integrations catalog

Zoom · SMTP · Stripe · Google Calendar · Microsoft Calendar · Slack · Teams · CRM · Marketing (ready/mock/configured)

OAuth-ready mobile client placeholder: `aep_mobile_dev`

## Jobs / cache / import-export

- Queue: email, notification, report, certificate, import, export, webhook  
- Cache: TTL + tag invalidation (`courses`, `blog`, `analytics`, …)  
- Import: students, instructors, courses, questions, communities  
- Export: csv, json, xlsx/pdf placeholders under `/exports/`

## Documentation

- Machine: `GET /api/v1/openapi` (OpenAPI 3.1)  
- Human: this file + updated `docs/API_OVERVIEW.md`

## Storage

- Runtime: `.data/aep-api-platform.json`  
- SQL twin: `database/migrations/016_api_platform.sql`
