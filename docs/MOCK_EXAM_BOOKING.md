# Mock Exam Booking System (CR007)

Independent module for invigilated mock exams (sourced from the Mock Exam document).

## Capabilities

| Feature             | Implementation                                              |
| ------------------- | ----------------------------------------------------------- |
| Booking             | Student / admin book against examiner slots                 |
| Availability        | Working hours + conflict with mock sessions & 1:1 bookings  |
| Dynamic Pricing     | Peak / off-peak multipliers per exam type                   |
| Extra Fees          | Weekend, rush, resit, certificate print (selectable / auto) |
| Automatic Meeting   | Zoom via `provisionStandaloneZoomMeeting` on confirm        |
| Certificate         | Issued on pass; verification code + HTML snapshot           |
| Session Completion  | Examiner / admin scores session                             |
| Working Hours       | Per-weekday UTC hours in admin config                       |
| Admin Configuration | Pricing mode, hours, catalog, fees                          |

## Surfaces

| Role                | Path                                           |
| ------------------- | ---------------------------------------------- |
| Student             | `/student/mock-exams`                          |
| Instructor          | `/instructor/mock-exams`                       |
| Admin / Super Admin | `/admin/mock-exams`, `/super-admin/mock-exams` |

## Runtime

- Store: `.data/aep-mock-exams.json`
- API: `/api/mock-exams`, `/api/mock-exams/certificate/[id]`
- SQL: `database/migrations/024_mock_exam_booking.sql`
