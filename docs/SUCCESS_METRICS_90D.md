# Success metrics — first 90 days (Task 025)

**Product:** AviatorPass v1.0 GA  
**Purpose:** Executive KPIs for hypercare and early operations. Track via Analytics / Ops Center dashboards and agreed export cadence.

## KPI register

| #   | KPI                    | Definition                                      | Source                     | 30d target | 60d target | 90d target | Owner       |
| --- | ---------------------- | ----------------------------------------------- | -------------------------- | ---------- | ---------- | ---------- | ----------- |
| 1   | Platform uptime        | `%` successful `/api/health?ready=1` samples    | Host + Ops health          | ≥ 99.0%    | ≥ 99.5%    | ≥ 99.5%    | Ops         |
| 2   | Student registrations  | New verified student accounts                   | Auth / users analytics     | _set_      | _set_      | _set_      | Growth      |
| 3   | Course enrollments     | New enrollments                                 | Courses / learning         | _set_      | _set_      | _set_      | Academic    |
| 4   | Live class attendance  | Attendees / invited (or join events)            | Classes attendance         | _set_      | _set_      | _set_      | Instructors |
| 5   | Course completion rate | Completions / active enrollments                | Progress / certificates    | _set_      | _set_      | _set_      | Academic    |
| 6   | Instructor activity    | Active instructors (login or class host) / week | Analytics                  | _set_      | _set_      | _set_      | Ops         |
| 7   | Revenue                | Successful payments (live Stripe)               | Payments reports           | _set_      | _set_      | _set_      | Finance     |
| 8   | Support satisfaction   | CSAT or ticket CSAT sample                      | Support tickets / feedback | ≥ 4.0/5    | ≥ 4.2/5    | ≥ 4.3/5    | Support     |
| 9   | System performance     | p95 API latency key routes; dashboard TTFB      | Host metrics / benches     | Baseline   | ≤ +10%     | ≤ baseline | Engineering |
| 10  | Critical incidents     | Sev-1 count                                     | Ops Center                 | 0          | ≤ 1        | ≤ 2        | Ops         |
| 11  | Backup success         | Daily backup jobs succeeded                     | Ops backups                | 100%       | 100%       | 100%       | Ops         |
| 12  | Security events closed | Critical vulns open > SLA                       | Audit / debt               | 0          | 0          | 0          | Security    |

_Client fills numeric enrollment/revenue targets at activation._

## Review cadence

| Cadence  | Forum                      | Inputs                              |
| -------- | -------------------------- | ----------------------------------- |
| Weekly   | Hypercare standup          | Uptime, incidents, tickets          |
| Biweekly | Product / academic         | Enrollments, attendance, completion |
| Monthly  | Executive dashboard review | All KPIs + revenue                  |
| Day 90   | Success retrospective      | KPI outcomes → v1.1 / v2 decisions  |

## Dashboard mapping

| KPI group   | In-product view                               |
| ----------- | --------------------------------------------- |
| Academic    | Admin / instructor analytics & reports        |
| Executive   | Super-admin analytics / monitoring            |
| Reliability | Ops Center + system logs + `/api/health`      |
| Revenue     | Payments reports / wallets (when Stripe live) |
| Support     | Ops tickets, feedback, KB usage               |

## Baseline capture

Record at GA+1 day:

| Metric            | Value | Captured by | Date |
| ----------------- | ----- | ----------- | ---- |
| Active students   |       |             |      |
| Published courses |       |             |      |
| Open tickets      |       |             |      |
| p95 `/api/health` |       |             |      |

## Sign-off

KPI targets agreed: Client ________ Vendor ________ Date ________
