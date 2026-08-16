# Customer journey PDFs (source of truth)

Official Arabic customer-journey documents for AviatorPass product lanes.
These files are the **design/spec source** for platform behaviour — not marketing downloads.

## Mapping (upload name → repo file)

| Original upload name | Repo path | Public URL |
| -------------------- | --------- | ---------- |
| `Aviator_Pass_Basics of Aviation_Customer_Journey_AR.pdf` | `Basics_Customer_Journey_AR.pdf` | `/brand/source/journeys/Basics_Customer_Journey_AR.pdf` |
| `Aviator_Pass_Private Pilot License_Customer_Journey_AR.pdf` | `PPL_Customer_Journey_AR.pdf` | `/brand/source/journeys/PPL_Customer_Journey_AR.pdf` |
| `Aviator_Pass_ِِATPL Package_Exam_Customer_Journey_AR.pdf` | `ATPL_Package_Customer_Journey_AR.pdf` | `/brand/source/journeys/ATPL_Package_Customer_Journey_AR.pdf` |
| `Aviator_Pass_ELP Mock_Exam_Customer_Journey_AR.pdf` | `ELP_Mock_Customer_Journey_AR.pdf` | `/brand/source/journeys/ELP_Mock_Customer_Journey_AR.pdf` |

## Implementation hooks

| Journey PDF | Platform implementation |
| ----------- | ----------------------- |
| Basics | Courses `BASICS-REC-01` / `BASICS-LIVE-01` + SKUs · `services/journeys/customer-journey-catalog.ts` |
| PPL | Courses `PPL-REC-01` / `PPL-LIVE-01` + SKUs · same catalog |
| ATPL Package | Product SKU `ATPL-PACKAGE` · CGI assignment · installments/BNPL · `services/cgi/` + payments |
| ELP Mock | Exam type `ELP-MOCK` · hours Mon–Fri 17–20 / Sat–Sun 09–18 · rush fees · `services/mock-exams/` |

Alignment checklist: `docs/CUSTOMER_JOURNEY_ALIGNMENT.md`  
Automated checks: `tests/unit/customer-journey-alignment.test.ts`
