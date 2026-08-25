# NOTIFICATION_SYSTEM_REPORT.md

**Project:** AviatorPass / ATPL PASS  
**Branch:** `cursor/enterprise-notifications-0987`  
**Date:** 2026-08-25

---

## Executive summary

A **centralized enterprise notification engine** now powers in-app alerts (with email bridge), preferences, smart grouping, archive/delete, search/filters, and near-realtime unread polling. Domain modules call one API — `emitNotification` / `notifyUsers` — instead of ad-hoc writes.

---

## Notification types

Canonical catalog: `types/notifications.ts` → `NOTIFICATION_CATALOG`.

| Audience    | Examples                                                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Student     | `account.*`, `course.*`, `payment.*`, `class.*`, `assignment.*`, `quiz.*`, `mock_exam.*`, `certificate.issued`, `ticket.reply`, `security.*` |
| Instructor  | `instructor.*`, `class.*`, `assignment.submitted`, `payout.completed`, `wallet.updated`                                                      |
| CGI         | `cgi.instructor_assignment`, `cgi.schedule_conflict`, `cgi.progress_warning`, class cancel/reschedule                                        |
| Admin       | `admin.registration`, payments, tickets, `ops.email_failure`, `ops.zoom_failure`, `system.error`                                             |
| Super Admin | All of the above + `ops.deployment`, `ops.health`, `ops.backup`                                                                              |

Each type has **priority** (`critical` → `informational`), **category**, **delivery urgency** (`immediate` / `grouped` / `digest`), and **emailDefault**.

---

## Database schema

### Runtime (JSON)

`AuthDatabase.notifications` in `.data/aep-auth.json` — extended fields:

`category`, `priority`, `status`, `actionUrl`, `groupKey`, `dedupeKey`, `archivedAt`, `deletedAt`, `emailSentAt`

### SQL migration

`database/migrations/030_enterprise_notifications.sql` — enums + columns + indexes for Supabase/Postgres.

### Preferences

Per-user `NotificationPreferences`: in-app, email, push (reserved), marketing, reminder, security, course, booking, payment, message.

---

## API architecture

| Method    | Path                              | Purpose                                                                                   |
| --------- | --------------------------------- | ----------------------------------------------------------------------------------------- |
| GET       | `/api/notifications`              | List + filters (`q`, `status`, `category`, `priority`, `from`/`to`, `grouped`) + `tookMs` |
| PATCH     | `/api/notifications`              | `action`: `read` \| `archive` \| `delete`                                                 |
| DELETE    | `/api/notifications?id=`          | Soft delete                                                                               |
| POST      | `/api/notifications/read-all`     | Mark all read                                                                             |
| GET/PATCH | `/api/notifications/preferences`  | User preferences                                                                          |
| GET       | `/api/notifications/unread-count` | Lightweight poll (~15s client)                                                            |
| GET       | `/api/v1/notifications`           | Mobile list (existing)                                                                    |

**Engine entry points**

- `emitNotification` — single user
- `notifyUsers` / `notifyRole` — fan-out
- Legacy `createNotification` delegates to `emitNotification`

---

## User flows

1. **Bell** — unread badge, grouped rows, category tabs, 15s unread poll, mark one/all, link to center
2. **Notification Center** (all roles) — search, status/type/priority filters, archive/delete, load more, preferences panel
3. **Preferences** — toggles gate categories; security alerts still preferred path
4. **Email** — catalog `emailDefault` + user/platform gates → `emailPaymentUpdate` bridge (transactional templates)

---

## Smart grouping

Unread items sharing `groupKey` collapse to:

> “You have N new {label}”

Examples: assignments, messages, quizzes, wallet updates.

**Dedupe:** same `dedupeKey` within 5 minutes returns the existing record (no spam).

---

## Performance results

| Check               | Result                                                 |
| ------------------- | ------------------------------------------------------ |
| Unit list/emit path | Engine tests pass; list includes `tookMs`              |
| Target              | &lt; 200ms local JSON store (measured in API `tookMs`) |
| Queries             | Single auth DB read for list; no N+1                   |

Realtime: **poll** via `/api/notifications/unread-count` every 15s (SSE/WebSocket reserved for future).

---

## Test results

```
tests/unit/notification-engine.test.ts — 6/6 passed
- emit with catalog metadata
- dedupe window
- smart grouping
- preference gating
- search + mark all read
- default preferences
```

`npx tsc --noEmit` — clean.

---

## Resolved issues

| Before                              | After                                                  |
| ----------------------------------- | ------------------------------------------------------ |
| Flat `createNotification` only      | Full engine + catalog                                  |
| Unused per-user prefs               | Enforced in `emitNotification`                         |
| No archive/delete/search            | API + UI                                               |
| Weak bell filters                   | Grouped UI + categories + poll                         |
| Certificate/welcome email-only gaps | In-app emits on register, OTP, new device, certificate |

---

## Future expansion plan

1. True **SSE/WebSocket** push for unread + toast
2. Dedicated **push / mobile** channel adapters (FCM/APNs)
3. Digest job for `delivery: "digest"` overnight emails
4. Super Admin ops feed from `writeOpsLog` → `ops.*` notifications
5. Prisma sync when Supabase is primary store
6. Webhook `notification.created` for API platform partners

---

## Acceptance checklist

- [x] Centralized engine (no duplicated write paths for new code)
- [x] In-app notifications + Notification Center
- [x] Email for important catalog types (gated)
- [x] Preferences enforced
- [x] Smart grouping + dedupe
- [x] Archive / delete / search / filter / pagination
- [x] Near-realtime unread poll
- [x] Role-oriented catalog + key emitters wired
- [x] TypeScript clean; unit tests green
- [x] Migration `030` for Postgres parity
