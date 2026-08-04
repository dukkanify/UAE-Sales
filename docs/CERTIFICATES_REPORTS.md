# Certificates, Academic Progress & Reports (Task 010)

Enterprise certification, progress tracking, transcripts, and reporting for ATPL PASS.

## Scope

Included:

- Digital certificates (auto/manual issue, approval, revoke, reissue, optional expiry)
- Public verification by number / verification code / QR
- Reusable branded certificate templates
- Student progress snapshot, academic performance, timeline
- Student transcript (HTML print/PDF + CSV/Excel)
- Instructor, admin, and executive reports with CSV export

**Not included:** payments, AI, wallets, community/blog.

## Runtime

- JSON: `.data/aep-certificates.json`
- SQL: `database/migrations/009_certificates_reports.sql`
- QR: `qrcode` package (data URL embedded on certificates)

## Services

| Service | Path |
|---------|------|
| Certificate | `services/certificates/certificate-service.ts` |
| Templates | `services/certificates/template-service.ts` |
| Verification | `services/certificates/verification-service.ts` |
| Progress | `services/certificates/progress-service.ts` |
| Transcript | `services/certificates/transcript-service.ts` |
| Reporting | `services/certificates/reporting-service.ts` |
| Export | `services/certificates/export-service.ts` |

## Permissions

| Action | Permission |
|--------|------------|
| Manage / issue certificates & templates | `certificates.manage` |
| View own certificates / transcript | `certificates.own` |
| Instructor reports | `reports.own` |
| Admin / executive reports | `reports.view` |

## API

| Path | Purpose |
|------|---------|
| `GET/POST /api/certificates` | List / issue |
| `GET/POST /api/certificates/:id` | Detail/QR · approve/revoke/reissue · `?print=1` HTML |
| `GET/POST /api/certificates/verify` | **Public** verification |
| `GET/POST /api/certificates/templates` | Template CRUD |
| `GET /api/reports/progress` | Snapshot / academic / timeline |
| `GET /api/reports/transcript` | JSON / CSV / printable HTML |
| `GET /api/reports/overview` | Instructor / admin / executive (+ CSV) |

## UI

- Student: gallery, viewer, progress, transcript
- Instructor / Admin / Super Admin: certificate management, templates, reports
- Public: `/verify/certificate`

## Security

- Duplicate active certificates blocked per student+course
- SHA-256 digital signature payload
- Verification is read-only and public
- Students only access own reports; staff RBAC enforced
- All issue/approve/revoke/export actions are activity-logged
