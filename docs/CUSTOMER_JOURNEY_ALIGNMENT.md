# Customer journey alignment

Audit + implementation map for the four AviatorPass customer-journey PDFs.

## Journeys

| Journey                             | Status             | Notes                                                                                              |
| ----------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| Private Pilot License — Recorded    | Aligned            | `PPL-REC-01` · 100h · sequential lock · DRM settings · checkout SKU                                |
| Private Pilot License — Live Online | Aligned            | `PPL-LIVE-01` · 8 weeks · publishable separately from recorded                                     |
| Basics of Aviation — Recorded       | Aligned            | `BASICS-REC-01` · 10h                                                                              |
| Basics of Aviation — Live Online    | Aligned            | `BASICS-LIVE-01`                                                                                   |
| ATPL Complete Package               | Aligned (platform) | SKU `ATPL-PACKAGE` · CGI · assignment · reports · schedule                                         |
| ELP Mock Exam                       | Aligned            | Exam type `ELP-MOCK` · Mon–Fri 17–20 / Sat–Sun 09–18 · rush 24h / 12h fees · cert after completion |

## Cross-cutting

| Requirement                      | Implementation                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| Publish live XOR recorded        | Super Admin publishing filter + per-course hide (`services/courses/publishing.ts`) |
| Single-session / anti-share      | `singleDeviceLogin` + max concurrent sessions + watermark deterrents               |
| No screenshot/recording          | UI deterrents in learning player (browser cannot fully block capture)              |
| Course detail fields             | Objectives, hours, language AR/EN, Captain Abdulaziz, price, enroll CTA            |
| Tabby KW / Tamara UAE            | `regional-rules-service` exclusivity + installments 4/5/6                          |
| Invoice to student + Super Admin | Invoice/receipt emails + `admin_alert` on paid checkout                            |
| Course available email           | Payment automation event after successful checkout                                 |
| Auto certificate                 | `maybeAutoIssueCertificate` wired from lesson completion                           |
| Sequential lessons               | `assertLessonUnlocked` when `sequentialLock` / recorded journey                    |

## Seed entry points

- `ensureCustomerJourneyCourses()` — courses/syllabus/metadata
- `ensureCustomerJourneyProducts()` — checkout products
- `ensureMockExamsSeeded()` — ELP type + rush fees + working hours

Source PDFs live under the agent uploads / brand source docs for this engagement.
