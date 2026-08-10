# Advanced Email Automation (CR009)

Professional lifecycle email system for AviatorPass journeys that depend on outbound mail.

## Event catalog

| Event             | Typical audience     | Trigger examples                           |
| ----------------- | -------------------- | ------------------------------------------ |
| Registration      | Student              | OTP-verified signup                        |
| Payment           | Student              | Payment success / failure / installment    |
| Assignment        | Instructor + student | Assignment Engine schedules a session      |
| Reminder          | Student / instructor | Manual dispatch + class/installment queues |
| Certificate       | Student              | Certificate auto-issued                    |
| Homework          | Student              | Performance report includes homework       |
| Schedule          | Participants         | Live class created                         |
| Reschedule        | Participants         | Live class moved                           |
| Cancel            | Participants         | Live class cancelled                       |
| Invoice           | Student              | Invoice issued on paid order               |
| Receipt           | Student              | Payment receipt alongside invoice          |
| Admin alerts      | Admin / SA           | Ops alerts                                 |
| Instructor alerts | Instructors          | Ops alerts                                 |
| Student alerts    | Students             | Account alerts                             |

## Surfaces

| Role        | Path                 |
| ----------- | -------------------- |
| Admin       | `/admin/email`       |
| Super Admin | `/super-admin/email` |

Platform SMTP / kill-switches remain under Platform Settings → Email / Notifications.

## Runtime

- Facade: `services/email/automation-service.ts`
- Templates: `services/email/automation-templates.ts`
- Log store: `.data/aep-email-automation.json`
- Transport: existing `sendEmail` → SMTP or durable outbox
- API: `GET/POST /api/email/automation`
- SQL reference: `database/migrations/026_advanced_email_automation.sql`

## Dispatch

```ts
await dispatchEmailEvent({
  event: "schedule",
  userIds: [...],
  data: { title, when, detail },
  actorId,
});
```
