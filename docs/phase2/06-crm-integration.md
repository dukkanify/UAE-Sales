# P2-06 — CRM integration

## Goal

Bi-directional sync of leads, contacts, and enrollments.

## Systems

- HubSpot
- Salesforce
- Zoho CRM
- Microsoft Dynamics
- Extensible connector interface for future CRMs

## Pattern

- Outbound webhooks + inbound connector jobs
- Mapping table: CRM object ↔ AEP user/enrollment
- Flag: `crmIntegration`

## Acceptance

- [ ] At least one connector (HubSpot or Salesforce) certified
- [ ] Failed sync retries via queue
- [ ] Secrets in vault only
