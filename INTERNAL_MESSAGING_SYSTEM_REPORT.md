# INTERNAL MESSAGING SYSTEM REPORT

**Product:** AviatorPass / ATPL PASS  
**Module:** Enterprise Internal Messaging  
**Branch:** `cursor/enterprise-messaging-0987`  
**Date:** 2026-08-25

---

## 1. Architecture

All communication stays **inside** the platform. There is no WhatsApp, Telegram, SMS, or phone-number exchange path for instructional chat.

```
┌──────────────┐     REST + poll      ┌─────────────────────────┐
│ Messaging UI │◄────────────────────►│ /api/communication/*    │
│ (role pages) │                      │ conversations, upload,  │
└──────────────┘                      │ directory, tickets      │
                                      └────────────┬────────────┘
                                                   │
                      ┌────────────────────────────┼────────────────────────────┐
                      ▼                            ▼                            ▼
           messaging-service            moderation-service            notification-service
           attachment-service           support-service               (in-app + email prefs)
                      │                            │
                      └────────────┬───────────────┘
                                   ▼
                    .data/aep-communication.json
                    (json-file-store; Vercel RO-safe)
```

**Realtime model:** Short-interval polling (`MESSAGE_POLL_MS` ≈ 2.5s) for messages, typing, presence, and unread badges. Presence TTL ≈ 45s. Typing TTL ≈ 4s. Suitable for local/json store; WebSocket/SSE can replace the poll layer later without changing the domain model.

**Role surfaces:** `/student/messages`, `/instructor/messages`, `/cgi/messages`, `/admin/messages`, `/super-admin/messages` — all render `MessagingCenter`.

**Support:** Dual path — persistent **Support chat** conversation (`kind: support`) plus formal **tickets** with assign / escalate / close / internal notes.

---

## 2. Permissions Matrix

| Actor ↓ / Peer → | Student | Instructor | CGI | Admin | Super Admin | Support chat          |
| ---------------- | ------- | ---------- | --- | ----- | ----------- | --------------------- |
| **Student**      | ❌      | ✅         | ✅  | ✅    | ✅          | ✅ (dedicated thread) |
| **Instructor**   | ✅      | ❌         | ✅  | ✅    | ✅          | ✅                    |
| **CGI**          | ✅      | ✅         | ✅  | ✅    | ✅          | ✅                    |
| **Admin**        | ✅      | ✅         | ✅  | ✅    | ✅          | ✅                    |
| **Super Admin**  | ✅      | ✅         | ✅  | ✅    | ✅          | ✅                    |

Enforced in:

- `services/communication/access.ts` → `assertCanMessagePeer`
- `app/api/communication/directory/route.ts` (directory scoped to allowed peers)
- Every conversation mutation via `assertParticipant` / `assertCanMessage`

Students **cannot** message other students. Instructors **cannot** message peer instructors (route via CGI/Admin). Support history is never hard-deleted for the requester (archive only).

RBAC permissions: `messaging.own`, `messaging.manage`, `support.own`, `support.manage`.

---

## 3. Database Design

Store file: `.data/aep-communication.json` via `services/communication/store.ts`.

| Collection                           | Purpose                                                                           |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| `conversations`                      | Direct / support / group threads + participants (mute, archive, lastReadAt)       |
| `messages`                           | Body, attachments, deliveryStatus, shareKind, reply, reactions, pinned, deletedAt |
| `typing`                             | Ephemeral typing indicators                                                       |
| `presence`                           | Online heartbeat / lastSeenAt                                                     |
| `attachments`                        | Uploaded file metadata                                                            |
| `tickets` / `ticketReplies`          | Formal support tickets + internal notes                                           |
| `moderationRules` / `moderationLogs` | Auto-moderation config + audit                                                    |
| Communities / blog / announcements   | Adjacent communication center modules                                             |

**Message delivery statuses:** `sending` → `sent` → `delivered` → `read` (+ `failed` client-side with retry UX).

**Training share kinds:** homework, lesson notes, study material, PDF manuals, flight documents, performance reports, instructor feedback, mock exam files, certificates.

---

## 4. Security Review

| Control                    | Implementation                                                         |
| -------------------------- | ---------------------------------------------------------------------- |
| In-transit encryption      | HTTPS in deployment; Next.js API routes only                           |
| AuthZ on every request     | `requirePermission(MESSAGING_OWN)` + peer/participant asserts          |
| Unauthorized thread access | `assertParticipant` (super_admin override for ops)                     |
| XSS                        | React text nodes; no `dangerouslySetInnerHTML` in chat body            |
| Attachments                | MIME allow-list, configurable max size, `virusScanHook` before persist |
| Off-platform contact       | Phone / email / WhatsApp / Telegram **blocked** + moderation log       |
| Profanity / abuse / scam   | Block rules with admin-reviewable logs                                 |
| Delete window              | Own-message soft-delete within `MESSAGE_DELETE_WINDOW_MS` (15 min)     |
| Support privacy            | Internal ticket notes hidden from requester                            |

---

## 5. Feature Coverage

| Feature                                     | Status |
| ------------------------------------------- | ------ |
| One-to-one + support + role chats           | ✅     |
| Typing indicators                           | ✅     |
| Online / offline presence                   | ✅     |
| Read / delivered receipts                   | ✅     |
| Unread counters                             | ✅     |
| Reply / react / pin / copy / forward        | ✅     |
| Conversation + thread search                | ✅     |
| Archive / mute / soft-delete                | ✅     |
| Attachments (PDF/Office/images/zip/audio)   | ✅     |
| Aviation share kinds in composer            | ✅     |
| Notifications (center + email prefs)        | ✅     |
| Support tickets + escalate + internal notes | ✅     |
| System welcome message in Support           | ✅     |
| Emoji composer + date separators            | ✅     |
| Skeleton loading + responsive layout        | ✅     |

---

## 6. Performance Results

| Check              | Result                                                           |
| ------------------ | ---------------------------------------------------------------- |
| Conversation list  | Sorted by `lastMessageAt`; optional `q` filter server-side       |
| Message pagination | `limit` + `before` cursor on listMessages                        |
| Poll cadence       | 2.5s active thread; presence/typing filtered by TTL              |
| Attachment path    | Local `public/uploads/communication` or Supabase when configured |
| Store IO           | json-file-store with in-memory cache; safe on read-only hosts    |

Unit suite `tests/unit/enterprise-messaging.test.ts` covers peer matrix, moderation blocks, support persistence, delivery→read, moderated reject, delete window.

---

## 7. Testing Results

| Gate                                            | Result                                                                                        |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `npm run typecheck`                             | ✅ Pass                                                                                       |
| `npm run lint`                                  | ✅ Pass                                                                                       |
| Full vitest suite                               | ✅ 158 tests / 45 files                                                                       |
| Unit: peer matrix                               | ✅                                                                                            |
| Unit: moderation (profanity / phone / WhatsApp) | ✅                                                                                            |
| Unit: support conversation idempotence          | ✅                                                                                            |
| Unit: send + read receipts + shareKind          | ✅                                                                                            |
| Unit: delete window                             | ✅                                                                                            |
| API E2E (student OTP session)                   | ✅ Support create/send, moderation 422, instructor DM + `lesson_notes`, directory peer filter |
| Manual UI                                       | ✅ Messaging center + Support thread; Suspense fix cleared `useSearchParams` console errors   |

API evidence: `messaging-api-e2e.log` (Support send, phone block, instructor DM).  
UI evidence: Support chat with system welcome + receipts (`messaging-support-open.png`).

---

## 8. Resolved Issues

1. **Incomplete peer matrix** — students could previously reach other students via gaps; instructors could DM peer instructors. Fixed in access + directory.
2. **Phone/email only flagged** — upgraded default (and legacy) rules to **block** off-platform contact.
3. **Thin message model** — added shareKind, reply, reactions, pin, presence, support kind.
4. **Support history loss** — delete on support conversations now archives only.
5. **TypeScript Message / TicketReply gaps** — seed + reply constructors updated; store normalizes legacy rows.
6. **Missing notification catalog types** — added `ticket.updated`, `message.group_added`, `document.shared`.

---

## 9. Future Improvements

1. Replace polling with WebSocket / SSE for true push realtime.
2. Wire production AV scanner into `virusScanHook` (currently noop-clean).
3. Enforce instructor↔student **assignment graph** (currently role-allowed for demo/local).
4. End-to-end encrypted message payloads at rest (field-level encryption).
5. Native push notifications (catalog already prepared for future delivery channel).
6. Full emoji library + GIF stickers if product wants richer composer.
7. Dedicated Support Team role (today mapped to Admin / Super Admin agents).

---

## 10. Acceptance Criteria Checklist

- ✅ Internal messaging works for Student / Instructor / CGI / Admin / Super Admin
- ✅ No external communication required
- ✅ Permissions enforced on API + directory
- ✅ Attachments upload with scan hook + MIME limits
- ✅ Notifications for new messages / support / documents
- ✅ Near-realtime updates via poll
- ✅ Read receipts + typing + presence
- ✅ Profanity / phone / off-platform filtering
- ✅ Report published as `INTERNAL_MESSAGING_SYSTEM_REPORT.md`
