# Known limitations — ATPL PASS v1.6

Honest constraints for go-live and support. Full audit: `docs/ENTERPRISE_READINESS_022.md`.

## Data layer

- Runtime demo/staging may still use **JSON stores under `.data/`**.
- Production target is **Supabase Postgres + Storage**; SQL lives in `database/migrations/`.
- Until Supabase is wired, multi-instance Vercel deploys do not share writable JSON state.

## Integrations

| Integration               | Status                                                             |
| ------------------------- | ------------------------------------------------------------------ |
| Email OTP delivery        | Requires provider env; demo OTP for non-prod only                  |
| Zoom                      | Session/join flow present; live Zoom Meeting API needs credentials |
| Stripe payments / Connect | Code paths exist; live charges need Stripe keys + webhook          |
| Supabase Auth/Storage     | Client packages present; full cutover pending env + migrations     |
| Antivirus on upload       | Hook stub — enable real AV in production ops                       |

## Product surfaces

- Some aspirational nav destinations may remain lightweight until content is configured.
- Blog depth depends on seeded communication/content; treat as limited if empty.
- Cross-browser and device matrix must be **manually confirmed on staging** (automated UAT uses HTTP fetch, not Safari/WebKit UI).

## Security / ops

- Demo OTP must remain **disabled** in production.
- Rate limits and IP blocks are settings-driven; tune after observing real traffic.
- CSP may start in report-only — tighten after collecting violation reports.

## Accessibility

- Core controls use accessible Radix primitives; a full WCAG audit with assistive tech is recommended as a post-launch hardening item.
