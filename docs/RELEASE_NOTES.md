# Release notes — ATPL PASS v1.0 (Task 016)

## Highlights

- Final QA / UAT pass for public launch readiness.  
- Instructor course listing RBAC corrected (`GET /api/courses` respects `COURSES_OWN`).  
- Automated UAT harness: `npm run uat` (28 role/workflow checks).  
- Handover documentation pack under `docs/` (QA, UAT, guides, limitations, roadmap).

## Included platform capabilities (prior tasks)

Authentication & RBAC · dashboards · course management · student learning · live classes/Zoom stubs · calendar · communication · quizzes · certificates · reports · analytics · payments & instructor wallet · AI assistant · platform settings · monitoring · backups.

## Fixes in this release

- **BUG-016-001 (High):** Instructors can list their own courses via `/api/courses` without needing global course-manage permission.

## Upgrade notes

1. Merge `cursor/aep-qa-launch-0987` after CI green.  
2. Set production env from `.env.production.example`.  
3. Run `npm run backup` and confirm restore test.  
4. Complete `docs/PRODUCTION_CHECKLIST.md` including post-launch items.  
5. Obtain client sign-off on `docs/UAT_APPROVAL.md`.
