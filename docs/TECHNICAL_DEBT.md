# Technical debt tracker

Statuses: `open` · `scheduled` · `in_progress` · `done` · `wontfix`

| ID     | Item                                              | Category     | Severity | Status    | Notes                                               |
| ------ | ------------------------------------------------- | ------------ | -------- | --------- | --------------------------------------------------- |
| TD-001 | JSON stores → Supabase cutover                    | architecture | high     | open      | Migrations 001–016 ready                            |
| TD-002 | In-memory rate limit → Redis                      | scalability  | medium   | open      | Multi-instance                                      |
| TD-003 | Expand Playwright to full role UI journeys        | testing      | medium   | open      | UAT HTTP covers APIs                                |
| TD-004 | PDF/XLSX real export workers                      | feature-debt | low      | open      | Placeholders in v1 export                           |
| TD-005 | CSP report-only → enforce                         | security     | medium   | open      | Collect violations first                            |
| TD-006 | Replace demo OTP paths in prod docs automation    | security     | high     | scheduled | Checklist already gates                             |
| TD-007 | Component Testing Library suite for design system | testing      | low      | open      | `cn` unit exists                                    |
| TD-008 | Deprecated cookie-only mobile clients             | deprecation  | low      | open      | Prefer `/api/v1` Bearer                             |
| TD-009 | Queue worker process (not in-request)             | architecture | medium   | open      | `processQueue` today                                |
| TD-011 | Apply Prettier across legacy codebase             | quality      | low      | open      | CI checks new quality paths; `format:all` available |

## Process

1. Log debt when shipping intentional shortcuts
2. Link PRs that create or retire debt
3. Review monthly in Ops Center / planning

Related: `docs/KNOWN_LIMITATIONS.md`, `docs/ROADMAP.md`.
