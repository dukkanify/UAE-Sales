# P2-01 — Native mobile applications (React Native)

## Goal

Ship iOS and Android apps for students and instructors without breaking the web v1.0 experience.

## Platforms

- iOS (App Store)
- Android (Play Store)

## Features

- Student app (courses, classes, quizzes, certificates, messaging)
- Instructor app (classes, attendance, grading assist, messages)
- Push notifications (APNs / FCM)
- Offline learning (download lessons + sync progress)
- Biometric login (Face ID / fingerprint) wrapping existing session/refresh
- Mobile certificates (view + share)
- Mobile attendance
- Mobile messaging

## Architecture

- Monorepo app under `apps/mobile` (React Native / Expo recommended)
- Consume **versioned** `GET/POST /api/v1/*` + future `/api/v2/*`
- Secure token storage (Keychain / Keystore)
- Feature flag: `mobileApps`

## Non-breaking rules

- Do not change web cookie auth semantics
- Mobile uses Bearer + refresh (`MOBILE_API.md`)
- Offline writes queue locally; conflict policy = server wins on progress

## Acceptance

- [ ] Student and instructor role journeys on device
- [ ] Push delivery for class reminders
- [ ] Offline lesson playback + sync
- [ ] Biometric unlock of stored session
- [ ] Store review builds signed & documented
