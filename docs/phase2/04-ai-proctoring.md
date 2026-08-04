# P2-04 — AI proctoring

## Goal

Integrity monitoring for online exams without changing quiz scoring contracts.

## Support

- Face detection
- Multiple face detection
- Browser / tab switch detection
- Suspicious activity alerts
- Identity verification (photo ID vs selfie — optional)

## Integration

- Hook into quiz attempt lifecycle (`attempt.started` / events)
- Store proctoring events; never block grading API shape
- Flag: `aiProctoring`

## Privacy

- Explicit consent; retention policy; region storage rules

## Acceptance

- [ ] Events logged for tab blur / multi-face
- [ ] Instructor/admin review UI
- [ ] Student informed consent gate
