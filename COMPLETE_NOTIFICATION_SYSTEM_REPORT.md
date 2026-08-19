# Complete Notification System Report

Sooqna now routes important business events through one pipeline:

```text
Business Event → notify() → In-App notification → Email (Resend)
```

The existing in-app store, bell, and web-push path were kept. Email is an extra channel. Email failure never throws into listing approval, booking, payment, order, escrow, applications, or quotes.

## Architecture

Central entry: `services/notifications/notification.service.ts` (`notify`, `notifyAdmins`).

Event helpers: `services/notifications/notification-events.ts`.

Each call carries:

- recipient (`userId` + optional email override)
- event type
- title / message (Arabic + English)
- action URL
- in-app + email delivery
- `emailStatus`: `pending` | `sent` | `failed` | `skipped` | `not_requested`
- idempotency key (same event = one in-app row)

In-app still uses `services/payments/notification-store.ts`. Duplicate keys are skipped there. Email uses `email-log.json` with pending/sent/failed/skipped and one automatic retry on send failure. If eight emails fail in 30 minutes, admins get an operational in-app alert.

## Registration, OTP, password reset

- Registration OTP is emailed only. API responses no longer include `otp`.
- Display cookie, sessionStorage fallback, on-screen OTP, and toast-with-code were disabled.
- Production demo OTP remains gated: `NODE_ENV !== "production" && ENABLE_DEMO_OTP === "true"`. Demo OTP cannot work in production even if `ENABLE_DEMO_OTP=true`.
- After successful verification: welcome in-app + welcome email (`WELCOME:{userId}`).
- Password reset stays a hashed one-time link. Passwords are never emailed.

Set in production:

```env
ENABLE_DEMO_OTP=false
RESEND_API_KEY=...
EMAIL_PROVIDER=resend
EMAIL_FROM_NAME=Sooqna
EMAIL_FROM_ADDRESS=no-reply@sooqna.site
NEXT_PUBLIC_APP_URL=https://sooqna.site
```

## Listing, featured, favorites, saved search

| Event | Key | In-app | Email |
| --- | --- | --- | --- |
| Submitted | `LISTING_SUBMITTED:{listingId}` | Seller: قيد المراجعة | Confirmation |
| Admin review | `ADMIN_LISTING_REVIEW:{listingId}` | Admins only | — |
| Approved | `LISTING_APPROVED:{listingId}` | منشور | Direct listing link |
| Rejected | `LISTING_REJECTED:{listingId}` | Reason | Edit listing link |
| Featured payment required | `FEATURED_PAYMENT_REQUIRED:{listingId}` | Seller | Pay CTA |
| Featured paid / activated | `FEATURED_ACTIVATED:{listingId}:{until}` | Seller | Confirmation |
| Featured expired | `FEATURED_EXPIRED:{listingId}:{until}` | Seller | Notice |
| Favorite price / sold | `FAVORITE_PRICE:` / `FAVORITE_SOLD:` | If prefs allow | If prefs allow |
| Saved search match | `SAVED_SEARCH:{searchId}:{listingId}` | If prefs allow | If prefs allow |

Saved searches are still stored on-device and also synced to the server when the user is logged in, so matching can run after listing approval.

## Bookings, quotes, jobs

Viewing bookings start as `pending` so the seller/agent can confirm. Slots stay held while pending/confirmed/rescheduled.

- Create: buyer confirmation + seller new booking (property, customer, date, time, visitors, contact, booking link).
- Status: confirm / reschedule / cancel / complete notifies the other party. Example copy: **تم تأكيد موعد المعاينة**.
- Inbox: `/dashboard/bookings`.

Quote requests notify customer + provider on create, then both parties on quoted / accepted / rejected / expired / converted. Inbox: `/dashboard/quotes`.

Job applications notify applicant + employer on create. Applicant is notified on viewed / shortlisted / rejected / accepted. Inbox: `/dashboard/applications`.

## Orders, payment, escrow

- New paid order: buyer confirmation + escrow-held copy (**تم حفظ المبلغ بأمان في الضمان المالي**) + seller new order.
- Payment failed: buyer + admin ops alert.
- Seller proof, buyer match, refund, escrow release (including admin release).
- Seller release copy: **تم تأكيد الاستلام وتم تحرير المبلغ إلى رصيدك**.
- Favorite watchers are notified when a listing is purchased.

Current order statuses are `paid_held_in_escrow` / `delivered` / `confirmed` / `released` / `disputed` / `refunded`. Preparing / shipped / out-for-delivery helpers exist on the notification type union for when those statuses are added to checkout.

## Chat

Every new message creates an in-app notification (`CHAT_MESSAGE:{conversationId}:{5min bucket}`). Email uses the existing 30-minute dedupe plus the messages preference so active threads are not spammed.

## Admin alerts (not every user action)

- New listing awaiting review
- New dispute
- Payment failure / refund
- Failed-email threshold
- Cancelled viewing booking
- Reported listing
- Account pending approval

## Notification center

- Page: `/notifications` (bell and profile still link here).
- Unread count on the bell.
- Mark one as read (click) and mark all as read.
- Icon per event type.
- Correct `href` and relative timestamp.
- Arabic + English copy and timestamps.
- Mobile dropdown + desktop panel; full list on the notifications page.

## Preferences

Users can later (and now) control: email, booking updates, order updates, messages, marketing, saved searches.

Transactional/security mail (OTP, welcome, listing review, bookings, orders, escrow, jobs, quotes) stays on even if the email toggle is off.

## Duplicate protection examples

- `LISTING_APPROVED:{listingId}`
- `BOOKING_CONFIRMED:{bookingId}:{statusVersion}:buyer`
- `ORDER_PAID:{orderId}:buyer`
- `ESCROW_HELD:{orderId}:buyer`
- Stripe webhook retries and double submits reuse the same key.

## Email templates

`buildSooqnaEmailHtml` is RTL for Arabic and LTR for English, with Sooqna branding and `NEXT_PUBLIC_APP_URL` / `https://sooqna.site` links. OTP mail uses the same branded wrapper; the code exists only in the email body.

## What this environment cannot prove

`RESEND_API_KEY` is not set here, so real inbox delivery, SPF, and DKIM cannot be confirmed from this agent run. After deploy, send one listing-submit and one viewing-booking with a real mailbox and confirm:

1. In-app row appears in `/notifications`
2. Email arrives from `no-reply@sooqna.site`
3. OTP for register is in email only and never in the Network tab JSON

## Validation

- `npm run lint`
- `npm run build`
