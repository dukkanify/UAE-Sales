# P2-02 — Corporate training portal

## Goal

Dedicated B2B portal for aviation companies to manage employee training.

## Capabilities

- Company accounts
- Employee management
- Department management
- Corporate reports
- Training assignment
- Company billing
- Company certificates

## Depends on

- Multi-tenant (`P2-03`) for company = tenant or org-within-tenant
- Enterprise SSO (`P2-09`) for employee login
- Learning paths (`P2-05`) for assignments

## Flag

`corporatePortal`

## Acceptance

- [ ] Company admin can invite employees by department
- [ ] Assign required courses / paths
- [ ] Company invoice separate from consumer checkout
- [ ] Aggregate completion certificates for company
