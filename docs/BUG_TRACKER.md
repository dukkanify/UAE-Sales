# Bug tracker — Task 016

Status values: `open` · `in_progress` · `fixed` · `verified` · `closed` · `wontfix`

| ID | Title | Priority | Module | Status | Assigned | Resolution | Verified |
|----|-------|----------|--------|--------|----------|------------|----------|
| BUG-016-001 | `GET /api/courses` denied instructors (`COURSES_MANAGE` only) | High | Courses / RBAC | closed | Platform | Allow `COURSES_OWN` and force `instructorId=user.id` | UAT 28/28 |

## Categories

- **Critical** — data loss, auth bypass, payment corruption, production outage
- **High** — role cannot complete primary workflow; security weakness
- **Medium** — degraded UX, non-blocking API inconsistency
- **Low** — copy, polish, non-blocking a11y

## Process

1. Log bug with priority + module  
2. Fix on `cursor/<name>-0987`  
3. Retest affected module + full `npm run uat`  
4. Mark verified → closed only after UAT green  

## Known non-bugs / deferred

See `docs/KNOWN_LIMITATIONS.md` (mock data store, live Zoom/Stripe until env wired).
