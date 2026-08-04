# Ownership transfer — Task 025

**Product:** ATPL PASS v1.0 GA  
**Prerequisite:** Contractual payment obligations fulfilled (client finance confirmation attached to acceptance).

Transfer **only after** `CLIENT_ACCEPTANCE_025.md` is signed Accepted (or Accepted with limitations) and payment gate is clear.

## Transfer checklist

| Asset                               | From (vendor) | To (client) | Method                         | ☐ Done | Date |
| ----------------------------------- | ------------- | ----------- | ------------------------------ | ------ | ---- |
| Source code repository              | Vendor GitHub | Client org  | Invite / transfer ownership    | ☐      |      |
| Production environment              | Vendor Vercel | Client team | Project transfer / re-link     | ☐      |      |
| Domain / DNS                        | Registrar     | Client      | Registrar access + records     | ☐      |      |
| Hosting access                      | Vendor        | Client      | Admin seats                    | ☐      |      |
| Database ownership                  | Vendor        | Client      | JSON export / Supabase project | ☐      |      |
| Storage ownership                   | Vendor        | Client      | Bucket / upload volume access  | ☐      |      |
| Documentation                       | Repo `docs/`  | Client      | Already in repository          | ☐      |      |
| Administrator credentials           | Secure vault  | Client      | Vault share — **never git**    | ☐      |      |
| CI / GitHub Actions                 | Vendor        | Client      | Workflow secrets re-bound      | ☐      |      |
| Third-party apps (Zoom/Stripe/SMTP) | Vendor        | Client      | Account ownership / keys       | ☐      |      |
| Monitoring / alerting               | Vendor        | Client      | Ops contacts updated           | ☐      |      |
| Backup archives                     | Vendor        | Client      | Offsite copy confirmation      | ☐      |      |

## Access hygiene

1. Rotate all production secrets at transfer (session secret, OTP secrets, Stripe, Zoom, SMTP).
2. Disable vendor personal accounts after 14-day hypercare overlap (agreed window).
3. Confirm `ENABLE_DEMO_OTP=false` and non-demo admin passwords.
4. Update `CREDENTIALS_REGISTER.md` **outside git** with new owners.
5. Record repository tip SHA at transfer: ______________

## Related

- `SOURCE_CODE_HANDOVER.md`
- `INFRASTRUCTURE_HANDOVER.md`
- `CREDENTIALS_REGISTER.md`
- `HANDOVER.md`

## Sign-off

| Role            | Name | Signature | Date |
| --------------- | ---- | --------- | ---- |
| Vendor transfer |      |           |      |
| Client receiver |      |           |      |
