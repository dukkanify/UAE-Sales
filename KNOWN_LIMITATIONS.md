# Sooqna — Known Limitations

**Version:** `v0.1.0-beta`  
**Status:** Closed Beta Ready

This document lists intentional gaps in the current release. These are **not bugs** — they are forward-looking placeholders documented for beta testers.

---

## Placeholder Surfaces

### Checkout completion is placeholder

- **Route:** `/checkout`
- **Behavior:** "Buy now" correctly passes the listing reference (`slug` or `local-*` ID) and shows listing context.
- **Limitation:** No payment processor, no card form, no escrow hold creation. The page displays a Coming Soon message.

### Orders detail is placeholder

- **Route:** None (`/orders` does not exist)
- **Behavior:** There is no order history, order detail page, or fulfillment tracking.
- **Limitation:** Buy-now does not create an order record.

### Admin actions are mock / coming soon

- **Route:** `/admin`
- **Behavior:** Admin login succeeds and lands on a Coming Soon admin page.
- **Limitation:** No listing review queue, no approve/reject actions, no order moderation, no dispute resolution tools.

### Disputes form is placeholder

- **Route:** `/disputes/new`
- **Behavior:** Displays a Coming Soon page.
- **Limitation:** Cannot file a dispute, attach evidence, or link to an order.

### Notifications route is coming soon

- **Route:** None (`/notifications` does not exist)
- **Behavior:** A mock notifications panel appears on the profile page via `ProfileActivityPanel`.
- **Limitation:** No dedicated notifications page, no read/unread persistence, no push or email alerts.

---

## Additional Technical Limitations

| Area | Limitation |
|------|------------|
| **Data storage** | Catalog listings are in-memory mocks. User sessions and local listings persist in `localStorage` only. |
| **Cross-device sync** | Data does not sync between browsers or devices. |
| **Backend API** | `services/apiClient.ts` exists but is not wired to any page. |
| **Payments** | Wallet and escrow balances are mock/demo values. |
| **Image upload** | Uses client-side compression and data URLs; no cloud storage provider. |
| **Order fulfillment** | "Mark order delivered" is not implemented for business accounts. |
| **Automated tests** | No test suite configured. Validation is manual + lint/build. |
| **UAE PASS** | Identity verification is UI-only; no real integration. |
| **Search indexing** | Local listings are searchable in the same browser only (not shared across users). |

---

## What This Means for Testers

You can fully test:

- Registration and login
- Creating and editing listings with dynamic category fields
- Browsing, searching, and viewing listing details
- Starting seller conversations
- Viewing wallet and escrow mock summaries
- Editing your profile

You should **not** expect:

- Completing a real purchase
- Viewing order history
- Admin approval workflows
- Filing or resolving disputes
- A standalone notifications inbox

For beta scope and feedback instructions, see [CLOSED_BETA_PLAN.md](./CLOSED_BETA_PLAN.md).
