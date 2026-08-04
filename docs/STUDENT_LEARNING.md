# Student Learning Journey (Task 008)

Premium student learning experience for ATPL PASS — dashboard, course/lesson player, progress, notes, bookmarks, favorites, resources, calendar, planner, and search.

## Runtime store

- JSON: `.data/aep-learning.json`
- SQL mirror: `database/migrations/007_student_learning.sql`

## Services (modular)

| Service | Path | Responsibility |
|---------|------|----------------|
| Learning | `services/learning/learning-service.ts` | Dashboard, my courses, resources, search, calendar, offline cache |
| Progress | `services/learning/progress-service.ts` | Touch/complete lessons, course state, overall progress |
| Notes | `services/learning/notes-service.ts` | Private CRUD + Markdown export |
| Bookmarks / Favorites | `services/learning/bookmark-service.ts` | Sync-ready bookmarks & favorites |
| Planner | `services/learning/planner-service.ts` | Study sessions, goals, AI suggestion hook |
| History | `services/learning/history-service.ts` | Learning activity trail |
| Access | `services/learning/access.ts` | Enrollment-only course/lesson access |

## API (`/api/learning/*`)

Requires `courses.enrolled`.

- `GET /dashboard` — overview cards + resume + recent activity
- `GET /courses` — enrolled courses (search/sort/favorites)
- `GET /courses/:courseId` — enrolled course detail + progress
- `GET /courses/:courseId/lessons/:lessonId` — lesson player payload (auto-starts progress)
- `POST /progress` — auto-save / complete lesson
- `GET|POST /notes`, `PATCH|DELETE /notes/:id` — private notes (`?export=md`)
- `GET|POST /bookmarks`, `DELETE /bookmarks/:id`
- `GET|POST /favorites`, `DELETE /favorites/:id`
- `GET|POST /planner/sessions`, `PATCH /planner/sessions/:id`
- `GET|POST /planner/goals`, `PATCH /planner/goals/:id` (`?suggest=1`)
- `GET /history`, `GET /resources`, `POST /resources` (download audit)
- `GET /search`, `GET /calendar`, `GET|POST /offline`

## Student UI routes

- `/student/dashboard` — learning journey overview
- `/student/courses` — My Courses
- `/student/courses/[courseId]/lessons/[lessonId]` — premium course/lesson player
- `/student/resources`, `/notes`, `/favorites`, `/planner`, `/calendar`, `/history`, `/search`

## Security

- Students only access **enrolled** courses (approved / completed / pending).
- Notes are private to `studentId`.
- Downloads are audited via history + activity log.
- Offline cache stores metadata only (no binary payloads) for future mobile sync.

## Out of scope

Quizzes, certificates, payments, wallets, and community features are intentionally not built in this task.
