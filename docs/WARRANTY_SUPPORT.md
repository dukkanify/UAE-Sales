# Warranty & support preparation — Task 020

Post-launch support phase for AviatorPass after client acceptance.

## Support contacts

| Role                      | Contact             | Notes                          |
| ------------------------- | ------------------- | ------------------------------ |
| Vendor / platform support | dukkanify@gmail.com | Primary engineering escalation |
| Client owner              | _fill at handover_  | Business approvals / UAT       |
| Technical operator        | _fill at handover_  | Day-to-day Super Admin         |
| Incident channel          | _fill Slack/email_  | Outages & security             |

Also use in-app support tickets and Ops Center (`/super-admin/ops-center`).

## Issue reporting process

1. User/admin opens ticket (in-app) or Ops Center support request.
2. Severity assigned (Critical / High / Medium / Low).
3. Acknowledge per SLA → investigate → fix on `cursor/<name>-0987`.
4. Verify with `npm run uat` / affected module retest.
5. Close only after verification; keep history in Ops Center.

Track legacy Task 016 defects in `docs/BUG_TRACKER.md`; prefer Ops Center Bugs for ongoing work.

## Response time guidelines (defaults)

Configurable in Ops Center → SLA. Suggested defaults:

| Severity | First response      | Workaround / fix target |
| -------- | ------------------- | ----------------------- |
| Critical | ≤ 2 hours           | Same business day       |
| High     | ≤ 8 business hours  | ≤ 2 business days       |
| Medium   | ≤ 24 business hours | Next release window     |
| Low      | ≤ 2 business days   | Backlog / polish        |

## Maintenance procedures

- Planned windows: set maintenance message + ETA (Settings / Ops Center).
- Announce before deploy; watch `/api/health?ready=1`.
- After deploy: smoke auth + one course path + payments health check.
- See `docs/MAINTENANCE.md`.

## Future enhancement process

1. Submit change request in Ops Center with business impact.
2. Estimate + approve → add to roadmap (`docs/ROADMAP.md` / Ops roadmap).
3. Implement on feature branch → PR → CI green → merge → record release.
4. No net-new features during warranty unless critical production fixes.

## Warranty scope (suggested)

| Included                          | Excluded                                                    |
| --------------------------------- | ----------------------------------------------------------- |
| Defect fixes for accepted scope   | New feature development (`V2_BACKLOG.md` / `ROADMAP_V2.md`) |
| Security patches for shipped code | Third-party outages (Stripe/Zoom/ESP)                       |
| Backup / restore guidance         | Content authoring / course writing                          |
| Ops assistance for env misconfig  | Hardware / client network issues                            |

### Support period & channels

Default warranty window: **as defined in the client contract** (fill: ____ months from final acceptance).  
Channels: in-app tickets, Ops Center, email (`dukkanify@gmail.com`), agreed incident channel.  
Bug process: Ops Center → severity → SLA → fix → verify → close.

**GA activation form:** complete `docs/WARRANTY_ACTIVATION_025.md` at Version 1.0 acceptance.  
**90-day KPIs:** `docs/SUCCESS_METRICS_90D.md`.

Payment obligations for source/handover delivery are contractual — release production credentials and private repo access only after agreed payment milestones (`docs/OWNERSHIP_TRANSFER_025.md`).
