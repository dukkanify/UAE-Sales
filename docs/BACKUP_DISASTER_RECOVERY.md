# Backup & disaster recovery

## What is backed up

| Asset | Location in archive |
|-------|---------------------|
| JSON data stores | `data/*.json` |
| Uploads (API backup) | `uploads/**` |
| Non-secret config snapshot | `config/snapshot.json` |
| Manifest + SHA-256 | `manifest.json` |

Archive root: `.backups/<id>/`

## Retention

| Cadence | Keep |
|---------|------|
| Daily | 14 |
| Weekly | 8 |
| Monthly | 12 |

## Create backups

```bash
npm run backup
npm run backup:weekly
npm run backup:monthly
```

Super Admin UI: **System logs → Run backup** (includes uploads).

Cron example:

```cron
0 2 * * * cd /app && npm run backup >> /var/log/aep-backup.log 2>&1
0 3 * * 0 cd /app && npm run backup:weekly
0 4 1 * * cd /app && npm run backup:monthly
```

## Restore testing

Always test before relying on a backup:

1. System logs → **Test restore**, or
2. `POST /api/ops` `{ "action": "test_restore", "backupId": "..." }`

This verifies file presence and SHA-256 without overwriting live data.

## Restore procedure

1. Put platform in maintenance mode
2. Run restore test — must pass
3. `POST /api/ops` `{ "action": "restore", "backupId": "...", "includeUploads": true }`
4. Restart app / clear CDN caches
5. Smoke auth + one course path
6. Disable maintenance mode

## Supabase / Postgres

When live DB is enabled:

- Enable Point-in-Time Recovery
- Schedule logical dumps if required by compliance
- Store encryption keys in a secrets manager (not git)

## RTO / RPO targets (initial)

| Metric | Target |
|--------|--------|
| RPO | ≤ 24h (daily backup) |
| RTO | ≤ 4h (restore + verify) |

Tighten after Supabase PITR is enabled.
