# Client handover package — ATPL PASS

**Milestone:** Task 020 — Final optimization, production deployment prep & project handover  
**Branch tip:** `cursor/aep-final-handover-0987`  
**Validation:** see `docs/FINAL_SYSTEM_VALIDATION.md`

## Delivery summary

ATPL PASS is **code-complete for launch** pending:

1. Client production environment configuration (Vercel domain/SSL/CDN, secrets).
2. Optional Supabase cutover for durable multi-instance data.
3. Client UAT sign-off on staging/production (`docs/UAT_APPROVAL.md`).
4. Contractual payment milestones before private source / credential release.

## Package contents

| Item                         | Location                                                             |
| ---------------------------- | -------------------------------------------------------------------- |
| Architecture overview        | `docs/ARCHITECTURE.md`                                               |
| Production readiness         | `docs/PRODUCTION.md`, `docs/PRODUCTION_OPTIMIZATION.md`              |
| Final system validation      | `docs/FINAL_SYSTEM_VALIDATION.md`                                    |
| Final security audit         | `docs/FINAL_SECURITY_AUDIT.md`                                       |
| Final acceptance checklist   | `docs/FINAL_ACCEPTANCE_CHECKLIST.md`                                 |
| Launch checklist             | `docs/PRODUCTION_CHECKLIST.md`                                       |
| QA report                    | `docs/QA_REPORT.md`                                                  |
| Bug tracker                  | `docs/BUG_TRACKER.md`                                                |
| UAT approval form            | `docs/UAT_APPROVAL.md`                                               |
| Student guide                | `docs/STUDENT_GUIDE.md`                                              |
| Instructor guide / manual    | `docs/INSTRUCTOR_GUIDE.md`                                           |
| Administrator guide / manual | `docs/ADMINISTRATOR_GUIDE.md`, `docs/ADMIN_MANUAL.md`                |
| Administrator training       | `docs/TRAINING.md`                                                   |
| API documentation            | `docs/API_OVERVIEW.md`, `docs/MOBILE_API.md`, `GET /api/v1/openapi`  |
| Deployment guide             | `docs/DEPLOYMENT.md`                                                 |
| Environment setup            | `docs/ENVIRONMENT_SETUP.md`                                          |
| Database schema              | `docs/DATABASE_SCHEMA.md`, `database/migrations/`                    |
| Maintenance guide            | `docs/MAINTENANCE.md`                                                |
| Warranty & support           | `docs/WARRANTY_SUPPORT.md`, `docs/SUPPORT.md`, `docs/OPS_SUPPORT.md` |
| Backup / DR                  | `docs/BACKUP_DISASTER_RECOVERY.md`                                   |
| Security                     | `docs/SECURITY.md`                                                   |
| Known limitations            | `docs/KNOWN_LIMITATIONS.md`                                          |
| Roadmap                      | `docs/ROADMAP.md`                                                    |
| Release notes                | `docs/RELEASE_NOTES.md`                                              |
| Testing strategy             | `docs/TESTING.md`                                                    |

## Access (fill at go-live)

| Field             | Value                                                   |
| ----------------- | ------------------------------------------------------- |
| Production URL    | _fill after Vercel promote_                             |
| Staging URL       | _fill after preview deploy_                             |
| Source repository | GitHub (this project) — release access per contract     |
| Super Admin       | `superadmin@eagerpilots.com` → **rotate** in production |
| Admin             | `admin@eagerpilots.com` → rotate                        |
| Instructor demo   | `instructor.one@eagerpilots.com` → disable or rotate    |
| Student demo      | `student.one@eagerpilots.com` → disable or rotate       |
| Demo OTP          | **Disable in production** (`ENABLE_DEMO_OTP=false`)     |

## Administrator training

Complete `docs/TRAINING.md` agenda (~90 min). Record attendees on that form.

## Support

| Role               | Contact             |
| ------------------ | ------------------- |
| Client owner       | _fill_              |
| Technical operator | _fill_              |
| Vendor / Dukkanify | dukkanify@gmail.com |
| Incident channel   | _fill Slack/email_  |

Process & SLA: `docs/WARRANTY_SUPPORT.md`.

## Deployment information

1. Configure Vercel project + production env from `.env.production.example`.
2. Attach custom domain (SSL automatic).
3. Optional: apply `database/migrations/` on Supabase + storage bucket.
4. Deploy `main` after merge of this tip (or agreed release tag).
5. Run `docs/FINAL_ACCEPTANCE_CHECKLIST.md` / `docs/PRODUCTION_CHECKLIST.md`.
6. Confirm monitoring on `/api/health?ready=1`.
7. Verify backup + restore test in production Ops UI.

## Project files

- Env templates: `.env.example`, `.env.production.example`
- Migrations: `database/migrations/`
- CI: `.github/workflows/ci.yml`
- Scripts: `npm run backup`, `uat`, `acceptance`, `test`, `test:e2e`

## Handover acknowledgement

| Field                  | Value            |
| ---------------------- | ---------------- |
| Client representative  | ________________ |
| Vendor representative  | ________________ |
| Date                   | ________________ |
| Documentation received | ☐                |
| Training completed     | ☐                |
| UAT approved           | ☐                |
| Production operational | ☐                |
| Support phase started  | ☐                |
