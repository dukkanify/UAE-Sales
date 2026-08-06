# Assessment System — Quiz Engine & Question Bank (Task 009)

Enterprise assessment module for AviatorPass.

## Scope

Included:

- Quiz CRUD (create, edit, duplicate, archive, publish/unpublish, soft delete)
- Central question bank (categories, subjects, modules, difficulty, tags, search, filters)
- Question types: MCQ single/multi, true/false, fill blank, short answer, essay, matching, ordering
- Quiz settings & exam rules (time limit, attempts, resume, auto-submit, randomize, negative marking)
- Student start / resume / submit / results / history
- Auto-grading + instructor manual grading panel
- Assessment analytics
- CSV / JSON / Excel-ready / PILOT100-mapped import

**Not included:** certificates, AI, payments, wallets, community, Safe Exam Browser / proctoring (hooks only).

## Runtime

- JSON store: `.data/aep-quizzes.json`
- SQL: `database/migrations/008_assessment_quizzes.sql`

## Services

| Service       | Path                                        |
| ------------- | ------------------------------------------- |
| Quiz          | `services/quizzes/quiz-service.ts`          |
| Question Bank | `services/quizzes/question-bank-service.ts` |
| Attempts      | `services/quizzes/attempt-service.ts`       |
| Grading       | `services/quizzes/grading-service.ts`       |
| Analytics     | `services/quizzes/analytics-service.ts`     |
| Import        | `services/quizzes/import-service.ts`        |

## Permissions

| Action                                      | Permission                                        |
| ------------------------------------------- | ------------------------------------------------- |
| Manage quizzes / bank / grading / analytics | `quizzes.manage` (instructor, admin, super_admin) |
| Take quizzes / view own attempts            | `quizzes.own` (student)                           |

Students must be enrolled in the linked course when `courseId` is set.

## API

| Path                                         | Purpose                                               |
| -------------------------------------------- | ----------------------------------------------------- |
| `GET/POST /api/quizzes`                      | List / create                                         |
| `GET/PATCH/DELETE /api/quizzes/:id`          | Detail / update / soft delete                         |
| `POST /api/quizzes/:id/actions`              | publish, unpublish, archive, duplicate, set_questions |
| `GET/POST /api/quizzes/bank`                 | Question bank list / create                           |
| `GET/PATCH/DELETE /api/quizzes/bank/:id`     | Question CRUD                                         |
| `GET/POST /api/quizzes/bank/import`          | Export / CSV·JSON·PILOT100 import                     |
| `POST /api/quizzes/:id/attempts`             | Start / resume attempt                                |
| `GET/PATCH /api/quizzes/attempts/:attemptId` | Load / autosave / submit                              |
| `GET/POST /api/quizzes/grading`              | Instructor grading                                    |
| `GET /api/quizzes/analytics`                 | Overview or per-quiz analytics                        |

## UI

- Instructor / Admin / Super Admin: list, builder, bank, grading, analytics
- Student: quiz list, take screen (timer + autosave), results & history

## External banks

`mapPilot100Payload()` prepares future **PILOT100** integration. Questions store `externalId` + `externalSource`.
