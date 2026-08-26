# DEMO_ACCOUNTS.md

**Product:** ATPL PASS (AviatorPass)  
**Purpose:** Permanent demo accounts for development, QA, client demos, and training walkthroughs.  
**Auth mode:** Email OTP (primary). Temporary passwords are set for reset-password / set-password demos.

---

## Quick start

1. Ensure `.env.local` has:
   ```bash
   ENABLE_DEMO_OTP=true
   DEMO_OTP_CODE=123456
   SUPER_ADMIN_EMAIL=superadmin@eagerpilots.com
   ```
2. Start the app: `npm run dev`
3. Open `/login`, enter a demo email, request OTP, enter **`123456`**.
4. Or reset everything via Super Admin API: `POST /api/admin/demo/reset`

---

## Account roles

| Role                        | Email                            | Status    | Verified | Permanent |
| --------------------------- | -------------------------------- | --------- | -------- | --------- |
| **Super Admin**             | `superadmin@eagerpilots.com`     | Active    | Yes      | Yes       |
| **Administrator**           | `admin@eagerpilots.com`          | Active    | Yes      | Yes       |
| **Chief Ground Instructor** | `cgi@eagerpilots.com`            | Active    | Yes      | Yes       |
| **Instructor (primary)**    | `instructor.one@eagerpilots.com` | Active    | Yes      | Yes       |
| **Instructor (secondary)**  | `instructor.two@eagerpilots.com` | Active    | Yes      | No        |
| **Student (primary demo)**  | `student.one@eagerpilots.com`    | Active    | Yes      | Yes       |
| **Student**                 | `student.two@eagerpilots.com`    | Active    | Yes      | No        |
| **Student (pending)**       | `student.three@eagerpilots.com`  | Pending   | Yes      | No        |
| **Student (suspended)**     | `student.four@eagerpilots.com`   | Suspended | Yes      | No        |
| **Student (journey)**       | `abdulaziz@aviatorpass.com`      | Active    | Yes      | No        |

---

## Temporary passwords

| Field                  | Value                                  |
| ---------------------- | -------------------------------------- |
| **Demo OTP**           | `123456` (when `ENABLE_DEMO_OTP=true`) |
| **Temporary password** | `DemoPass123!`                         |

Login UI is OTP-first. The temporary password is hashed onto demo accounts so **Forgot password → Reset password** and password verification demos work. It is a documented demo credential, not a production secret.

---

## Assigned permissions

### Super Admin (`superadmin@eagerpilots.com`)

Full system access — no restrictions. Includes:

Dashboard · User Management · Role Management · Course / Subject Management · Student / Instructor / CGI Management · Booking · Payments · Reports · Certificates · Notifications · Messaging · Blog · Community · Zoom · Email Templates · Platform Settings · Branding · Analytics · Security · Audit Logs

### Administrator (`admin@eagerpilots.com`)

Admin dashboard permissions: students, instructors, courses, classes, communities, reports, blog, messaging, announcements, support, calendar, bookings.

### Chief Ground Instructor (`cgi@eagerpilots.com`)

CGI dashboard: subject / lecture distribution, instructor assignment, schedule oversight, student monitoring, ATPL first-subject control.

### Instructor (`instructor.one@eagerpilots.com`)

Instructor dashboard: own courses, students, schedule, Zoom sessions, attendance, quizzes, assignments, certificates, earnings, reports.

### Student (`student.one@eagerpilots.com`)

Student dashboard: enrolled courses, calendar, bookings, live classes, assignments, quizzes, certificates, notifications, messaging, billing.

---

## Demo data included

Seeded automatically when demo OTP mode runs (`ensurePlatformDemoEnvironment`):

| Domain                  | What you see                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Profile**             | 100% complete student profile (phone, country, timezone, avatar, emergency contact) |
| **ATPL Program**        | Primary student enrolled in all published `ATPL-*` subjects                         |
| **Progress**            | Sample lesson progress + weekly study goal                                          |
| **Live sessions**       | Upcoming and completed Zoom mock classes                                            |
| **Bookings**            | Upcoming + completed Private Session bookings                                       |
| **Notifications**       | Class reminder, message, certificate, invoice samples                               |
| **Messaging**           | Student ↔ instructor demo conversation                                              |
| **Certificates**        | Sample issued certificate (when enrollment exists)                                  |
| **Payments / invoices** | Catalog products, wallets, demo paid order                                          |
| **CGI**                 | Subject plan, lecture assignments, oversight notes                                  |
| **Performance**         | Sample post-lecture performance review                                              |

Supporting accounts (pending / suspended) demonstrate admin workflows without blocking primary demos.

---

## Reset procedure

### Option A — Super Admin API

```bash
# Authenticated as Super Admin
curl -X POST http://localhost:3000/api/admin/demo/reset \
  -H "Content-Type: application/json" \
  -H "Cookie: <session>" \
  -d '{}'
```

Optional custom temporary password (min 8 chars):

```bash
curl -X POST http://localhost:3000/api/admin/demo/reset \
  -H "Content-Type: application/json" \
  -H "Cookie: <session>" \
  -d '{"password":"DemoPass123!"}'
```

Inspect status:

```bash
curl http://localhost:3000/api/admin/demo/reset -H "Cookie: <session>"
```

### Option B — Code / tests

```ts
import { resetDemoEnvironment } from "@/services/demo/reset-demo-environment";

resetDemoEnvironment();
```

### What reset does

1. Reactivates **permanent** demo accounts (active, verified, complete profiles, avatars).
2. Re-applies temporary password hashes.
3. Re-runs domain seeds and gap-fills ATPL enrollments, notifications, bookings, CGI plan, performance report.

Permanent accounts stay usable unless a Super Admin manually suspends them again after reset.

---

## Security notes

- No production customer data is used.
- Demo passwords and OTP are **public documentation** for local/staging only.
- Disable demo OTP in production: `ENABLE_DEMO_OTP=false` and do not set `FORCE_DEMO_OTP`.
- `POST /api/admin/demo/reset` requires `system.settings` (Super Admin).
- Do not reuse demo passwords for real operator accounts.

---

## Code map

| Concern              | Path                                                            |
| -------------------- | --------------------------------------------------------------- |
| Account catalog      | `constants/demo-accounts.ts`                                    |
| User upsert          | `services/auth/demo-users.ts`                                   |
| Domain orchestration | `services/demo/platform-demo-seed.ts`                           |
| Reset                | `services/demo/reset-demo-environment.ts`                       |
| API                  | `app/api/admin/demo/reset/route.ts`                             |
| Boot hook            | `services/auth/auth-service.ts` (`requestOtp` when demo OTP on) |

---

## Verification checklist

- [ ] Super Admin login → `/super-admin/dashboard`
- [ ] Student login → `/student/dashboard` with ATPL enrollments + notifications
- [ ] Instructor login → `/instructor/dashboard`
- [ ] CGI login → `/cgi/dashboard` with subject plan
- [ ] Messaging and notifications visible for student
- [ ] No 500s on role dashboards
- [ ] `npm run lint` / `typecheck` / `test` green
