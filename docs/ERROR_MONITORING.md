# Error monitoring — quality layer

## Sources

| Source           | Path / API                                       | Severity use |
| ---------------- | ------------------------------------------------ | ------------ |
| Client errors    | `POST /api/ops/client-error` · `app/error.tsx`   | medium/high  |
| Ops logs         | `.data/aep-ops-logs.json` · `/api/ops?view=logs` | by level     |
| API v1 logs      | `/api/v1/platform/monitoring`                    | 4xx/5xx      |
| Queue failures   | `/api/v1/platform/queue`                         | webhook/job  |
| Health fails     | Ops Center alerts                                | critical     |
| Payment webhooks | `/api/payments/webhooks`                         | high         |
| Zoom inbound     | `/api/v1/webhooks/inbound/zoom`                  | high         |

## Severity

- **Critical** — auth outage, payment corruption, data loss
- **High** — primary workflow blocked, webhook dead-letter
- **Medium** — elevated 5xx, queue retries
- **Low** — validation 4xx noise, UI handled errors

## Operator workflow

1. Super Admin → Monitoring / Ops Center / System logs
2. Filter category `error` / `security`
3. File bug in Ops Center when reproducible
4. Track systemic items in `docs/TECHNICAL_DEBT.md`
