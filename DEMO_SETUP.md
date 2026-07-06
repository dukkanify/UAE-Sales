# Demo Setup — UAE Sales

Follow these steps before every stakeholder presentation.

## Prerequisites

- Node.js 20+
- PostgreSQL running locally (or remote `DATABASE_URL` configured)
- `.env` file with at minimum:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/uae_sales?schema=public"
NEXT_PUBLIC_USE_API=true
SESSION_SECRET="demo-session-secret-min-32-characters-long"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Commands

Run from the project root:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Open the App

```
http://localhost:3000
```

## Verify Before Presenting

| Check | How |
|-------|-----|
| Homepage loads | Open `http://localhost:3000` — listings visible |
| API healthy | `curl http://localhost:3000/api/health` → `{"status":"ok","database":true}` |
| Login works | `user@uaesales.demo` / `User@123` / OTP `123456` |
| Build clean | `npm run lint && npm run build` (run once before demo day) |

## Optional: Automated Smoke Test

```bash
bash scripts/beta-qa-test.sh
```

> Waits 65 seconds initially to avoid OTP rate limits from prior runs.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Login returns server error | Run `npm run db:push && npm run db:seed` |
| OTP rate limited | Wait 60 seconds, retry |
| Empty homepage | Confirm seed completed; check `DATABASE_URL` |
| Port 3000 in use | Stop other processes or use `PORT=3001 npm run dev` |

## Presentation Environment Tips

- Use a clean browser profile (no extensions blocking cookies)
- Full-screen the browser (F11) for a polished look
- Pre-open tabs: homepage, login page (optional)
- Keep `DEMO_CREDENTIALS.md` and `DEMO_SCRIPT.md` open on a second screen
- Close unrelated terminal output before screen-sharing

## Related Docs

- `DEMO_SCRIPT.md` — step-by-step presentation flow
- `DEMO_CREDENTIALS.md` — account details
- `DEMO_CHECKLIST.md` — pre-demo verification list
- `INVESTOR_DEMO_NOTES.md` — talking points for stakeholders
