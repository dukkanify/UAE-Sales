# Chat + Notifications Phase 1 Report

## Overview

Phase 1 adds buyer–seller messaging around listings and a platform notifications center. The implementation reuses the UAE Sales premium RTL design system, works with PostgreSQL when configured, and falls back to in-memory mocks otherwise. Homepage and existing user flows are unchanged.

## Routes Added / Updated

| Route | Description |
|-------|-------------|
| `/chat` | Conversation list with sidebar layout and empty state |
| `/chat/[conversationId]` | Conversation detail with messages, listing preview, send input |
| `/chat?listing={slug}` | Resolves or creates a conversation for a listing (redirects to detail) |
| `/notifications` | Full notifications page with read/unread states |

## Chat Features

- Conversation list with unread badges
- Conversation detail with buyer/seller info
- Related listing preview panel
- Message bubbles (RTL-aware)
- Send message input
- Attach image mock (demo Unsplash URL)
- Mark messages as read on open
- Empty, loading, and not-found states
- Mobile-responsive split layout (list + detail)

## Notification Types

| Type | Arabic context |
|------|------------------|
| `new_message` | رسالة جديدة |
| `listing_approved` | تمت الموافقة على الإعلان |
| `listing_rejected` | تم رفض الإعلان |
| `order_created` | طلب جديد |
| `payment_held` | حجز ضمان |
| `payment_released` | إطلاق ضمان |
| `dispute_opened` | نزاع مفتوح |
| `wallet_updated` | تحديث المحفظة |

## APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/chat/conversations` | List conversations |
| GET | `/api/chat/conversations/[id]` | Conversation detail + messages |
| POST | `/api/chat/conversations/[id]/messages` | Send message |
| PATCH | `/api/chat/conversations/[id]/read` | Mark conversation read |
| GET | `/api/chat/unread-count` | Unread messages count |
| GET | `/api/chat/conversations/by-listing/[slug]` | Resolve/create by listing |
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Unread notifications count |
| PATCH | `/api/notifications/[id]/read` | Mark one notification read |
| PATCH | `/api/notifications/read-all` | Mark all notifications read |

All routes require authentication. Chat/notifications APIs use `withDataFallback()` for DB + mock.

## Mock Fallback

| Data | Mock module |
|------|-------------|
| Conversations + messages | `mock/chat.mock.ts` |
| Notifications | `mock/notifications.mock.ts` |

Mock actions persist in memory for the session:
- Send message appends to conversation
- Mark read clears unread counts
- Mark notification read updates state

## Dashboard Integration

- `DashboardActivityWidget` on profile shows:
  - Unread messages count
  - Unread notifications count
  - Recent notifications preview
  - Links to `/chat` and `/notifications`

## Admin Integration

- Admin dashboard shows platform notification activity count
- Admin disputes page includes dispute-related chat messages panel with links to `/chat/[id]`

## Schema Changes

- `Message.imageUrl` optional field for image attachment mock
- New `Notification` model with `NotificationType` enum
- `User.notifications` relation

## Key Files

```
app/chat/page.tsx
app/chat/[conversationId]/page.tsx
app/notifications/page.tsx
app/api/chat/**
app/api/notifications/**
features/chat/components/**
features/notifications/components/**
features/dashboard/components/DashboardActivityWidget.tsx
services/chat/**
services/notifications/**
lib/repositories/chat.repository.ts
lib/repositories/notifications.repository.ts
mock/chat.mock.ts
mock/notifications.mock.ts
```

## Validation

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass (115 routes) |

## Remaining Production Requirements

1. **Real-time messaging** — WebSockets or SSE for live message delivery
2. **Push notifications** — FCM/APNs for mobile and browser push
3. **Image upload** — S3/CDN storage instead of mock URLs
4. **Conversation model** — Dedicated DB table for metadata and typing indicators
5. **Message search** — Full-text search across conversations
6. **Notification triggers** — Auto-create notifications on order/escrow/listing events
7. **Email/SMS alerts** — Optional delivery channels for critical notifications
8. **Admin moderation** — Flag/report messages, block users
9. **Read receipts** — Per-message delivery and read status sync
10. **Pagination** — Infinite scroll for long conversation histories

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| User can open chat | ✅ |
| User can view conversations | ✅ |
| User can send mock message | ✅ |
| Notifications page works | ✅ |
| Read/unread states work | ✅ |
| Dashboard shows counts | ✅ |
| UI matches platform design | ✅ |
