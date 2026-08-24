# Release notes — ATPL PASS v1.1 (Task 017)

## Highlights

- **Ops Center** for post-launch support: health dashboard, alerts, SLA, bugs, change requests, releases, roadmap, incidents, backup verification, and maintenance control.
- Settings-driven **maintenance mode** enforced in middleware (Super Admin bypass) with professional public page (ETA + contact).
- Deep health checks add auth + security event monitoring; 5s cache for dashboard performance.
- SQL twin migration `015_support_ops.sql` for future Supabase cutover.

## Fixes / ops

- Nav: Ops Center, Ops/Backups, and Activity Logs correctly separated for Super Admin.

## Prior (v1.0 / Task 016)

- UAT harness (`npm run uat`), instructor course list RBAC fix, handover documentation pack.

## Upgrade notes

1. Merge `cursor/aep-ops-support-0987`.  
2. Review Ops Center SLA defaults and adjust for your support team.  
3. Record release `1.1.0` as deployed after production ship.  
4. Keep `docs/OPS_SUPPORT.md` synchronized with process changes.
