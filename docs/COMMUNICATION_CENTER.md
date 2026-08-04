# Communication Center (Task 011)

Enterprise messaging, communities, blog, announcements, support tickets, and moderation for ATPL PASS.

## Scope

Included:

- Private & group messaging (read/delivered, typing, mute/archive/delete, search)
- Learning communities (posts, pins, announcements, comments)
- Blog (categories, tags, drafts, schedule, SEO, related, comments)
- Automatic content moderation with configurable rules
- Support tickets with assignment, statuses, and response-time stats
- Targeted announcements
- Global communication search
- In-app notification hooks for message / community / ticket / announcement events
- Attachments via local uploads with Supabase Storage readiness

**Not included:** AI assistant, payments, instructor wallets, mobile apps.

## Runtime

- JSON: `.data/aep-communication.json`
- SQL: `database/migrations/010_communication_center.sql`
- Feature flags: `features.blog`, `features.communities` (enabled)

## Services

| Service | Path |
|---------|------|
| Messaging | `services/communication/messaging-service.ts` |
| Community | `services/communication/community-service.ts` |
| Blog | `services/communication/blog-service.ts` |
| Announcements | `services/communication/announcement-service.ts` |
| Support | `services/communication/support-service.ts` |
| Moderation | `services/communication/moderation-service.ts` |
| Search | `services/communication/search-service.ts` |
| Attachments | `services/communication/attachment-service.ts` |

## Permissions

| Permission | Who |
|------------|-----|
| `messaging.own` | All roles |
| `messaging.manage` | Admin+ |
| `community.access` | Students (+ staff) |
| `communities.moderate` | Admin+ |
| `blog.manage` | Admin+ |
| `announcements.manage` | Admin, Instructor |
| `announcements.view` | All |
| `support.own` | Student, Instructor, Admin |
| `support.manage` | Admin+ |

## API

| Path | Purpose |
|------|---------|
| `/api/communication/conversations` | List / start DM or group |
| `/api/communication/conversations/:id` | Thread, send, read, typing, mute/archive/delete |
| `/api/communication/communities` | List / create / join |
| `/api/communication/communities/:id` | Feed, post, comment, pin |
| `/api/communication/blog` | Public/admin blog + comments |
| `/api/communication/announcements` | List / publish |
| `/api/communication/tickets` | Tickets, replies, stats |
| `/api/communication/moderation` | Rules + logs |
| `/api/communication/search` | Global search |
| `/api/communication/upload` | Attachments |
| `/api/communication/directory` | User directory for DMs |

## UI

- Role messaging centers, community feeds, announcement centers, support desks
- Admin/super-admin blog studio + moderation panel
- Public `/blog` and `/blog/[slug]`

## Security

- Conversation participant checks on every message read/write
- Students limited to enrolled/member communities (+ general)
- Automatic moderation blocks offensive / scam content and flags PII/contact leakage
- Activity logging for messaging, community, blog, announcements, and tickets
