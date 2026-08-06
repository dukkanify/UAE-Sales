# Warranty & support activation — Task 025

**Product:** AviatorPass Version 1.0 GA  
**Policy reference:** `docs/WARRANTY_SUPPORT.md`

## Activation record

| Field                   | Value                                    |
| ----------------------- | ---------------------------------------- |
| Support start date      | ______________                           |
| Support end date        | ______________                           |
| Duration (default)      | _e.g. 90 days warranty / per contract_   |
| Primary support channel | In-app tickets + Ops Center              |
| Escalation email        | dukkanify@gmail.com _(update if needed)_ |
| Incident channel        | ______________ (Slack / email / phone)   |
| Client support owner    | ______________                           |
| Vendor support lead     | ______________                           |

## Response times (activated)

| Severity | First response      | Workaround / fix target |
| -------- | ------------------- | ----------------------- |
| Critical | ≤ 2 hours           | Same business day       |
| High     | ≤ 8 business hours  | ≤ 2 business days       |
| Medium   | ≤ 24 business hours | Next release window     |
| Low      | ≤ 2 business days   | Backlog / polish        |

Overrides (if contract differs):

---

## Escalation process

1. Ticket / Ops Center entry with severity.
2. L1 support triage → L2 engineering if defect.
3. Critical: page vendor lead + client technical owner.
4. Security incident: follow `SECURITY.md`; rotate secrets; preserve audit logs.
5. Close only after verification (`uat` / module retest as applicable).

## Maintenance windows

| Item             | Default                         | Agreed |
| ---------------- | ------------------------------- | ------ |
| Planned window   | Off-peak; announce ≥ 24h        | ☐      |
| Emergency window | As required for Critical        | ☐      |
| Deploy smoke     | Auth + course + payments health | ☐      |

## Scope reminder

| Included                                | Excluded                            |
| --------------------------------------- | ----------------------------------- |
| Defects in accepted v1.0 scope          | Net-new features (`V2_BACKLOG.md`)  |
| Security patches for shipped code       | Third-party Zoom/Stripe/ESP outages |
| Backup / restore guidance               | Course content authoring            |
| Ops assistance for configuration issues | Client network / endpoint hardware  |

## Activation signatures

| Party  | Name | Signature | Date |
| ------ | ---- | --------- | ---- |
| Client |      |           |      |
| Vendor |      |           |      |

**Warranty status:** ☐ Not started · ☐ Active · ☐ Expired · ☐ Extended (attach amendment)
