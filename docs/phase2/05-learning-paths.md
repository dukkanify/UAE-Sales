# P2-05 — Advanced learning paths

## Goal

Structured journeys beyond single-course enrollment.

## Support

- Prerequisites
- Learning paths
- Required courses
- Recommended courses
- Career tracks
- Certification paths

## Data model (additive)

`LearningPath` → ordered `PathNode` (course | quiz | certificate milestone)

## Flag

`learningPaths`

## Acceptance

- [ ] Admin CRUD paths
- [ ] Gate enrollment when prerequisites unmet
- [ ] Student progress along path
