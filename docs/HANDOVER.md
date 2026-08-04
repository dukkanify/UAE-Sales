# Client handover package — ATPL PASS

## Delivery summary

ATPL PASS is ready for production promotion pending env configuration, backup verification, and client UAT sign-off.

## Package contents

| Item | Location |
|------|----------|
| System overview | `docs/ARCHITECTURE.md`, `docs/PRODUCTION.md` |
| QA report | `docs/QA_REPORT.md` |
| Bug tracker | `docs/BUG_TRACKER.md` |
| UAT approval form | `docs/UAT_APPROVAL.md` |
| Student guide | `docs/STUDENT_GUIDE.md` |
| Instructor guide | `docs/INSTRUCTOR_GUIDE.md` |
| Administrator guide | `docs/ADMINISTRATOR_GUIDE.md`, `docs/ADMIN_MANUAL.md` |
| Deployment notes | `docs/DEPLOYMENT.md` |
| Release notes | `docs/RELEASE_NOTES.md` |
| Known limitations | `docs/KNOWN_LIMITATIONS.md` |
| Roadmap | `docs/ROADMAP.md` |
| Security | `docs/SECURITY.md` |
| Launch checklist | `docs/PRODUCTION_CHECKLIST.md` |
| Support runbooks | `docs/BACKUP_DISASTER_RECOVERY.md` |

## Access

| Field | Value |
|-------|-------|
| Production URL | _fill after Vercel promote_ |
| Staging URL | _fill after preview deploy_ |
| Super Admin | `superadmin@eagerpilots.com` (change password/OTP channel in prod) |
| Admin | `admin@eagerpilots.com` |
| Instructor demo | `instructor.one@eagerpilots.com` |
| Student demo | `student.one@eagerpilots.com` |
| Demo OTP | **Disable in production** (`ENABLE_DEMO_OTP=false`) |

## Training session (suggested agenda)

1. Role walkthrough (student → instructor → admin → super admin) — 30 min  
2. Ops: monitoring, backups, restore test — 20 min  
3. Payments & wallet overview — 15 min  
4. AI feature flags & usage — 10 min  
5. Support contacts & escalation — 10 min  

## Support contacts

| Role | Contact |
|------|---------|
| Client owner | _fill_ |
| Technical operator | _fill_ |
| Vendor / Dukkanify | dukkanify@gmail.com |
| Incident channel | _fill Slack/email_ |

## Project files

- Repository: GitHub (this project)  
- Branch tip for launch QA: `cursor/aep-qa-launch-0987`  
- Env templates: `.env.example`, `.env.production.example`  
- Migrations: `database/migrations/`  

## Deployment information

1. Configure Vercel project + production env.  
2. Optional: apply Supabase migrations and storage bucket.  
3. Deploy `main` after merge.  
4. Run post-launch checklist.  
5. Confirm monitoring probe on `/api/health?ready=1`.
