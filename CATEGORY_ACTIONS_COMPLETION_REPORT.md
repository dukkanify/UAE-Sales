# Category Actions Completion Report

## Summary

Replaced placeholder toasts for job applications, real estate viewing bookings, and service quote/booking requests with full modal flows and persistent APIs.

## Flows Implemented

| Action | Modal | API |
|--------|-------|-----|
| تقديم الآن (APPLY_JOB) | `JobApplicationModal` | `POST /api/job-applications` |
| احجز معاينة (BOOK_VIEWING) | `ViewingBookingModal` | `POST /api/viewing-bookings` |
| طلب عرض سعر (REQUEST_QUOTE) | `QuoteRequestModal` | `POST /api/quote-requests` |
| احجز الخدمة (BOOK_SERVICE) | `QuoteRequestModal` (booking mode) | `POST /api/quote-requests` |

## Validation & Duplicate Prevention

- **Jobs:** one application per user per listing (`DUPLICATE_APPLICATION` → 409)
- **Viewings:** slot availability check + duplicate date/time guard
- **Quotes:** one request per user per listing within 7 days

## Notifications

Applicant/buyer and employer/seller receive entries via `notification-store` for each successful submission.

## Admin Visibility

- `/admin/job-applications`
- `/admin/viewing-bookings`
- `/admin/quote-requests`

## Storage

`.data/job-applications.json`, `.data/viewing-bookings.json`, `.data/quote-requests.json`

## Files Added/Changed

- `features/listings/components/{JobApplicationModal,ViewingBookingModal,QuoteRequestModal}.tsx`
- `features/listings/components/ListingPrimaryAction.tsx`
- `services/{job-applications,viewing-bookings,quote-requests}/*-store.ts`
- `app/api/{job-applications,viewing-bookings,quote-requests}/**`
- `shared/ui/Modal.tsx`

## Remaining Risks

- CV/attachment files store filename only (no blob storage in demo phase).
- Viewing slots are config-based, not seller-managed calendars.
