# Course Management / LMS Core

Enterprise LMS foundation for AviatorPass (MASTER TASK 006).

## Scope

Included:

- Course CRUD (create, edit, duplicate, archive, publish/unpublish, soft delete)
- Categories (main + sub, icons, order, visibility, metadata JSON)
- Structure: Course → Modules → Lessons → Resources
- Enrollment foundation (manual, bulk, suspend/resume, transfer, drop)
- Instructor assignment (primary + assistant)
- Progress **schema/foundation only** (no learning runtime)
- Search, filters, bulk actions, media upload
- Activity / audit logging for all mutations
- Admin / Super Admin management UI; instructor & student read-only catalogs

**Not included:** Zoom, quizzes, payments, certificates, attendance, messaging, calendar booking.

## Runtime store

`.data/aep-courses.json` via `services/courses/*` (same dual-track as auth/settings).

Production shape: `database/migrations/005_course_management_lms.sql` + Prisma models.

Media: `public/uploads/courses/` locally, or Supabase Storage when `storage.provider === "supabase"`.

## Permissions

| Action                                   | Permission                            |
| ---------------------------------------- | ------------------------------------- |
| Manage catalog / structure / enrollments | `courses.manage` (admin, super_admin) |
| View assigned courses                    | `courses.own` (instructor)            |
| View enrolled courses                    | `courses.enrolled` (student)          |

Students **cannot** mutate course content through any API.

## API surface

| Method           | Path                                           | Purpose                                                   |
| ---------------- | ---------------------------------------------- | --------------------------------------------------------- |
| GET/POST         | `/api/courses`                                 | List / create                                             |
| GET/PATCH/DELETE | `/api/courses/[id]`                            | Detail / update / soft delete                             |
| POST             | `/api/courses/[id]/actions`                    | publish, unpublish, archive, duplicate, assign_instructor |
| POST             | `/api/courses/bulk`                            | Bulk publish/archive/delete/assign/category/export        |
| GET              | `/api/courses/stats`                           | Dashboard widgets                                         |
| GET              | `/api/courses/catalog`                         | Instructor/student read catalog                           |
| GET/POST         | `/api/courses/categories`                      | Categories                                                |
| PATCH/DELETE     | `/api/courses/categories/[id]`                 | Category update/delete                                    |
| GET/POST         | `/api/courses/[id]/modules`                    | Modules (+ reorder)                                       |
| PATCH/DELETE     | `/api/courses/[id]/modules/[moduleId]`         | Module update/delete                                      |
| GET/POST         | `/api/courses/[id]/modules/[moduleId]/lessons` | Lessons                                                   |
| GET/PATCH/DELETE | `/api/courses/[id]/lessons/[lessonId]`         | Lesson + resources                                        |
| GET/POST         | `/api/courses/[id]/enrollments`                | Enrollments                                               |
| POST             | `/api/courses/media`                           | Thumbnail/cover/video/attachment upload                   |

## UI routes

- `/super-admin/courses`, `/super-admin/courses/[id]`, `/super-admin/courses/categories`
- `/admin/courses`, `/admin/courses/[id]`, `/admin/courses/categories`
- `/instructor/courses` (read-only assigned)
- `/student/courses` (read-only enrolled)

## Services (SOLID)

- `category-service`, `course-service`, `module-service`, `lesson-service`, `enrollment-service`, `media-service`
- Validation in `validation.ts` (unique codes, titles, scheduled dates, instructor presence for publish)
