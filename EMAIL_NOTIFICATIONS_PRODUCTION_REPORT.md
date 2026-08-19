# Sooqna email notifications — production report

Email is an **additional channel** beside the existing in-app notification system. In-app `createNotification` calls stay in place. Email is attempted after in-app create, wrapped so a Resend outage never rolls back listing publish, payment, or order updates.

## Events connected to email

| Event | In-app | Email type | Recipient | CTA |
|---|---|---|---|---|
| Listing submitted / resubmitted after rejection | `listing_received` | `listing_received` | Seller | Listing page |
| Listing approved | `listing_approved` | `listing_approved` | Seller | Published listing `https://sooqna.site/listings/{slug}` |
| Listing rejected | `listing_rejected` | `listing_rejected` | Seller | Edit listing (includes rejection reason) |
| Featured listing payment | `listing_featured` | `featured_paid` | Seller | Listing page |
| New order / payment confirmed | `order_paid` / `escrow_held` | `order_paid` + `order_seller_new` | Buyer + seller | Order page (guest tracking link when applicable) |
| Receipt confirmed / escrow released | `order_confirmed` / `order_released` | `order_confirmed` / `order_released` | Buyer + seller | Order page |
| Seller proof uploaded (shipping-like) | `seller_proof` | `seller_proof` | Buyer | Order page |
| Dispute opened | `order_disputed` | `order_disputed` | Counterparty | Order page |
| Refunded (cancel/refund path) | `order_refunded` | `order_refunded` | Buyer + seller | Order page |
| Chat message | Unchanged local/in-app chat | `chat_message` (throttled, 30 min dedupe + rate limit) | Recipient | Conversation |
| Password reset | — | `password_reset` (secure link, 1 hour) | Account email | Reset form with token |
| Admin connectivity test | — | `system_test` | Signed-in admin | `https://sooqna.site` |

There is no separate `shipped` or `cancelled` order status in the product. Those map to **seller proof / delivered / confirmed / released** and **refunded**. Guest buyers still receive status emails via `buyerEmail` even when `buyerId` is missing.

Welcome, viewing-booking, job-application, and quote emails remain extra mail (not replacements for in-app). Their links also use `https://sooqna.site`.

## Templates

Shared builder: `services/email/sooqna-email-template.ts`

- Brand: سوقنا + `Sooqna | سوقنا`
- Logo: `https://sooqna.site/apple-icon`
- RTL: `direction:rtl; text-align:right`
- Mobile: fluid `max-width:560px; width:100%` with 16px outer padding
- Gold CTA button
- Plain-text alternative
- All production email links use `EMAIL_SITE_URL = https://sooqna.site`
- `getAppUrl()` never returns localhost when `NODE_ENV` or `VERCEL_ENV` is production
- No `localhost` / `http://` matches under `services/email/`

Sender:

```
Sooqna | سوقنا <no-reply@sooqna.site>
```

(`EMAIL_FROM_NAME` / `EMAIL_FROM_ADDRESS` in `.env.production.example`)

Password reset never includes the password or an OTP. It sends a tokenized HTTPS link only. OTP mail still exists only behind `NEXT_PUBLIC_ENABLE_EMAIL_OTP` (false in production examples).

## Resend configuration

Code path: `deliverEmailSafely` → Resend `POST https://api.resend.com/emails`.

Expected production env (Vercel Production):

| Variable | Required value |
|---|---|
| `RESEND_API_KEY` | Live Resend key |
| `EMAIL_PROVIDER` | `resend` |
| `EMAIL_FROM_NAME` | `Sooqna \| سوقنا` |
| `EMAIL_FROM_ADDRESS` | `no-reply@sooqna.site` |
| `NEXT_PUBLIC_APP_URL` | `https://sooqna.site` |

This Cloud Agent environment does **not** have `RESEND_API_KEY`. Vercel CLI is not authenticated here, so Production env presence cannot be listed. After deploy, use Admin → Notifications → **إرسال بريد تجريبي** to prove inbox delivery against the signed-in admin mailbox.

## Domain verification (SPF / DKIM)

Public DNS for `sooqna.site` was queried on 2026-08-19:

| Record | Host | Result |
|---|---|---|
| Apex A | `sooqna.site` | Present (`216.198.79.1`, Vercel) |
| SPF TXT | `sooqna.site` | **Missing** (no TXT answer) |
| MX | `sooqna.site` | **Missing** |
| DKIM | `resend._domainkey.sooqna.site` | **NXDOMAIN** |
| Return-path | `send.sooqna.site` / `bounces.sooqna.site` | **NXDOMAIN** |
| DMARC | `_dmarc.sooqna.site` | **NXDOMAIN** |

**The sending domain is not verified in public DNS.** Until Hostinger DNS (nameservers `apollo.dns-parking.com` / `athena.dns-parking.com`) has the exact TXT/MX/CNAME values from the Resend dashboard for `sooqna.site`, Resend may accept the API call but third-party inboxes will not reliably receive `no-reply@sooqna.site`.

Required operator steps:

1. Resend → Domains → add/verify `sooqna.site`
2. Publish the DKIM, SPF, and bounce MX/CNAME records Resend shows
3. Confirm the domain status is **Verified**
4. Optionally add `_dmarc.sooqna.site` TXT (`p=none` first)
5. Send the admin test email and confirm inbox (not only API 200)

Code treats `@resend.dev` onboarding From addresses as **not delivered**.

## Duplicate protection

Dedupe key: `{type}:{to}:{entityId}` stored in `email-log.json`.

- Default window: 24 hours for listing approval/rejection, orders, payments
- Listing submitted: 10 minutes (allows a later resubmit after rejection)
- Chat: 30 minutes
- Password reset: 2 minutes (plus rate-limit on the request route)
- Admin test: 1 minute
- Stripe webhook retries: `claimStripeWebhookEvent` plus email dedupe
- Featured payment: notify only when the Stripe session is newly completed
- Guest order confirmation runs first; logged-in `emailOrderPaid` is skipped if that order already has `emailDeliveryStatus === "sent"`
- Recent **pending** (under 2 minutes) also blocks a second send

Skipped attempts are logged as `skipped`.

## Failed email handling

- `deliverEmailSafely` never throws to callers
- Listing approve/reject/submit wrap email in `safeNotify`
- Order/payment paths use `.catch` after in-app notification
- Log statuses: `pending` → `sent` or `failed` (`skipped` for duplicates)
- HTML/text of each send is stored on the log so failed mail can be retried
- Admin can retry one log or all failed/pending logs
- Failed guest order mail is also queued in `pending-emails.json`
- A failed email **does not** un-publish a listing, un-capture a payment, or delete an in-app notification

## Email delivery test results

| Check | Result |
|---|---|
| `npm run lint` | See latest run in this PR |
| `npm run build` | See latest run in this PR |
| Template RTL + `https://sooqna.site` links | Pass (source review) |
| No localhost in production email builders | Pass |
| Duplicate key + webhook claim | Pass (code) |
| In-app notifications still created first | Pass (code) |
| Admin retry + test-email actions | Pass (code) |
| Public SPF / DKIM for `sooqna.site` | **Fail** — records not published |
| Real inbox delivery (listing submit / approve / reject / featured / order / refund / reset) | **Blocked until Resend domain DNS is verified and `RESEND_API_KEY` is set on Vercel.** Use the admin test button on production after DNS is fixed. |

## Remaining risks

1. **SPF/DKIM not in DNS** — highest delivery risk. Fix in Hostinger + Resend before treating mail as live.
2. **File-store logs** (`/tmp` on Vercel) are not durable across instances; dedupe and retry can weaken under multiple serverless isolates.
3. **SVG/icon in some clients**: logo uses `/apple-icon`; text brand remains if the image is blocked.
4. Chat is still **this-browser** for the thread itself; email is only a throttled heads-up.
5. OTP mail still exists behind `NEXT_PUBLIC_ENABLE_EMAIL_OTP` (currently false in production examples). Password reset for the live flow uses a **link**, not an OTP.

## Acceptance mapping

- In-app system remains the source of truth for the bell/inbox
- Email is additive
- Important listing, payment, and order events send both
- Password reset is a secure production link
- Email failure cannot cancel the business operation
- Retry is available from Admin → Notifications
