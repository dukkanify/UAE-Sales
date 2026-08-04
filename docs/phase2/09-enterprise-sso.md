# P2-09 — Enterprise SSO

## Goal

Federated login for academies and corporates.

## Support

- Google Workspace
- Microsoft Entra ID (Azure AD)
- Okta
- Auth0
- SAML 2.0
- OAuth / OIDC

## Flag

`enterpriseSso`

## Non-breaking

- Keep email OTP for consumer students
- Map IdP groups → roles carefully

## Acceptance

- [ ] OIDC login path for Admin/Instructor
- [ ] SAML path for enterprise tenant
- [ ] JIT provisioning with tenant membership
