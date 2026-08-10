# Performance Reports System (CR006)

After each lecture, the instructor completes a student evaluation form. The report is stored on the student account, emailed to the student, and visible to Super Admin.

## Form fields (student evaluation)

| Field         | Description                         |
| ------------- | ----------------------------------- |
| Today's Topic | Topic covered in this lecture       |
| Next Topic    | Planned follow-up topic             |
| Homework      | Assigned work                       |
| Performance   | Rating (excellent → unsatisfactory) |
| Question Bank | Practice bank / set references      |
| Comments      | Free-text instructor comments       |

## Flows

1. Instructor opens live class → **Performance report** tab
2. Selects student, fills form, **Save & email student**
3. Persisted in `.data/aep-performance-reports.json` (SQL twin: migration `023`)
4. Email via `performanceReportEmailTemplate` + outbox/SMTP
5. In-app notification on student account
6. Student: `/student/performance-reports`
7. Super Admin: `/super-admin/performance-reports`

## APIs

| Path                                             | Purpose                            |
| ------------------------------------------------ | ---------------------------------- |
| `GET/POST /api/classes/[id]/performance-reports` | Class-scoped list / submit         |
| `GET /api/performance-reports`                   | Student / instructor / admin lists |
| `GET /api/performance-reports?view=overview`     | Super Admin overview               |
