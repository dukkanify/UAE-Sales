# Dynamic Schedule Management (CR008)

Unified schedule control for **Live Courses** and **ATPL** journeys.

## Capabilities

| Capability          | Description                                             |
| ------------------- | ------------------------------------------------------- |
| Schedule Builder    | Create one-off or recurring sessions (+ Zoom/reminders) |
| Recurring Classes   | Daily / weekly / monthly expansion via recurring rules  |
| Next Session        | Next upcoming session for the signed-in role            |
| Reschedule          | Move a session; ATPL lecture links follow the new class |
| Cancel              | Cancel one session or an entire recurring series        |
| Student Reminder    | Immediate or queued reminders for student participants  |
| Instructor Reminder | Immediate or queued reminders for host / co-host        |
| Attendance          | Mark / list attendance on a session                     |
| Class Status        | Stored status + runtime (`upcoming` / `live_now` / …)   |
| Timeline            | Chronological schedule, reminders, attendance, lectures |

## Surfaces

| Role       | Path                   |
| ---------- | ---------------------- |
| Student    | `/student/schedule`    |
| Instructor | `/instructor/schedule` |
| CGI        | `/cgi/schedule`        |
| Admin      | `/admin/schedule`      |

Calendar views remain at `/student/calendar` and `/instructor/calendar`.

## API

- `GET /api/schedule?view=overview|sessions|next|timeline|status|attendance`
- `POST /api/schedule` actions: `build`, `reschedule`, `cancel`, `remind_students`, `remind_instructors`, `remind_all`, `attendance`

## Implementation notes

- Facade: `services/schedule/dynamic-schedule-service.ts`
- Reuses Live Classes CRUD, recurrence, Zoom, attendance, and reminder queue
- ATPL: `distributeLecture` with `scheduledAt` creates a Live Class and sets `liveClassId`
- Schedule Builder on ATPL courses also creates `AtplLectureAssignment` rows
- SQL reference: `database/migrations/025_dynamic_schedule_management.sql`
