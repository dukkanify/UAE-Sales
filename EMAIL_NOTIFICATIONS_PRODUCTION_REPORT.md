# Sooqna email notifications — production report

Email is an **additional channel** beside the existing in-app notification system. In-app `createNotification` calls are unchanged in behavior. Email is attempted after (or alongside) in-app create, wrapped so a Resend outage never rolls back listing publish, payment, or order updates.

## Events connected to email

| Event | In-app | Email type | Recipient | CTA |
|---|---|---|---|---|
| Listing submitted | `listing_received` | `listing_received` | Seller | Listing page |
| Listing approved | `listing_approved` | `listing_approved` | Seller | Published listing `https://sooqna.site/listings/{slug}` |
| Listing rejected | `listing_rejected` | `listing_rejected` | Seller | Edit listing (includes rejection reason) |
| Featured listing payment | `listing_featured` | `featured_paid` | Seller | Listing page |
| New order / payment confirmed | `order_paid` / `escrow_held` | `order_paid` + `order_seller_new` | Buyer + seller | Order page (guest tracking link when applicable) |
| Receipt confirmed / escrow released | `order_confirmed` / `order_released` | `order_confirmed` / `order_released` | Buyer + seller | Order page |
| Seller proof uploaded | `seller_proof` | `seller_proof` | Buyer | Order page |
| Dispute opened | `order_disputed` | `order_disputed` | Counterparty | Order page |
| Refunded | `order_refunded` | `order_refunded` | Buyer + seller | Order page |
| Chat message | Unchanged local/in-app chat | `chat_message` (throttled, 30 min dedupe + rate limit) | Recipient | Conversation |
| Password reset | — | `password_reset` (secure link, 1 hour) | Account email | Reset form with token |

There is no separate `shipped` or `cancelled` order status in the product. Those map to **delivered / confirmed / released** and **refunded**.

Welcome, viewing-booking, job-application, and quote emails remain as previously implemented extra mail (not replacements for in-app).

## Templates

Shared builder: `services/email/sooqna-email-template.ts`

- Brand: سوقنا + `Sooqna | سوقنا`
- Logo: `https://sooqna.site/apple-icon`
- RTL: `direction:rtl; text-align:right`
- Mobile: fluid `max-width:560px; width:100%` with 16px outer padding
- Gold CTA button
- Plain-text alternative
- All production links hardcoded to `https://sooqna.site` (`EMAIL_SITE_URL`)
- No localhost URLs in email builders (`services/email/` has zero `localhost` / `http://` matches)

Sender:

```
Sooqna | سوقنا <no-reply@sooqna.site>
```

(`EMAIL_FROM_NAME` / `EMAIL_FROM_ADDRESS` in `.env.production.example`)

Password reset never includes the password or an OTP. It sends a tokenized HTTPS link only.

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

This Cloud Agent environment **does not** have `RESEND_API_KEY` (or the other email env vars). Delivery cannot be proven from here.

## Domain verification (SPF / DKIM)

Must be confirmed in the Resend dashboard for `sooqna.site`:

1. Domain `sooqna.site` verified
2. DKIM records published
3. SPF includes Resend
4. From-address `no-reply@sooqna.site` allowed

If the domain is unverified, Resend may accept the API call but the message will not reach third-party inboxes. The sender code treats `@resend.dev` onboarding From addresses as **not delivered**.

## Duplicate protection

Dedupe key: `{type}:{to}:{entityId}` stored in `email-log.json`.

- Default window: 24 hours for listing/order/payment events
- Chat: 30 minutes
- Password reset: 2 minutes (plus rate-limit on the request route)
- Stripe webhook retries: `claimStripeWebhookEvent` plus email dedupe
- Featured payment: notify only when the Stripe session is newly completed
- Recent **pending** (under 2 minutes) also blocks a second send so overlapping requests do not double-fire

Skipped attempts are logged as `skipped`.

## Failed email handling

- `deliverEmailSafely` never throws to callers
- Listing approve/reject/submit wrap email in `safeNotify`
- Order/payment paths use `.catch` after in-app notification
- Log statuses: `pending` → `sent` or `failed`
- Failed guest order mail is also queued in `pending-emails.json` for later retry
- A failed email **does not** un-publish a listing, un-capture a payment, or delete an in-app notification

## Email delivery test results

| Check | Result |
|---|---|
| `npm run lint` | Pass |
| `npm run build` | Pass |
| Template RTL + `https://sooqna.site` links | Pass (source review) |
| No localhost in production email builders | Pass |
| Duplicate key + webhook claim | Pass (code) |
| In-app notifications still created first | Pass (code) |
| Real inbox delivery (listing submit / approve / reject / featured / order / refund / reset) | **Not executed here** — `RESEND_API_KEY` missing in the agent VM. Must be verified on Vercel production against a real mailbox after deploy. |

## Remaining risks

1. **File-store logs** (`/tmp` on Vercel) are not durable across instances; dedupe can weaken under multiple serverless isolates.
2. **Domain DNS** (SPF/DKIM) cannot be verified from this repo; misconfigured DNS is the usual reason Resend returns 200 but mail never arrives.
3. **SVG/icon in some clients**: logo uses `/apple-icon`; text brand remains if the image is blocked.
4. Chat is still **this-browser** for the thread itself; email is only a throttled heads-up.
5. OTP mail still exists behind `NEXT_PUBLIC_ENABLE_EMAIL_OTP` (currently false in production examples). Password reset for the live flow uses a **link**, not an OTP.

## Acceptance mapping

- In-app system remains the source of truth for the bell/inbox
- Email is additive
- Important listing, payment, and order events send both
- Password reset is a secure production link
- Email failure cannot cancel the business operation
