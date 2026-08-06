# AviatorPass Mobile (Phase 2)

React Native applications for **iOS** and **Android** (student + instructor).

> This folder is the **bootstrap home** for Phase 2 mobile work. The web v1.0 app remains the source of truth until mobile GA.

## Recommended stack

- Expo (managed) or React Native CLI
- TypeScript
- React Navigation
- Secure storage for refresh tokens
- Push: APNs + FCM via Expo Notifications or native modules
- Offline: SQLite / MMKV + sync queue against `/api/v1`

## Apps

| App        | Bundle focus                                        |
| ---------- | --------------------------------------------------- |
| Student    | Learning, classes, quizzes, certificates, messaging |
| Instructor | Sessions, attendance, messaging, light grading      |

Biometric unlock wraps an existing session — it does **not** replace OTP/SSO.

## Bootstrap (when execution starts)

```bash
# from repo root — example Expo workspace
npx create-expo-app@latest apps/mobile --template blank-typescript
```

Point `EXPO_PUBLIC_API_BASE_URL` at the deployed AEP `/api/v1` base.

## Contracts

- Prefer Bearer auth (`docs/MOBILE_API.md`)
- Discover Phase 2 flags via `GET /api/v2/capabilities`
- Never embed secrets in the mobile binary

## Flag

Enable server-side `features.mobileApps` only when TestFlight / Play internal tracks are ready.
