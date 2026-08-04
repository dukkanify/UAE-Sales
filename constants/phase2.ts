/**
 * Phase 2 capability / initiative registry (documentation-backed).
 */

export type Phase2PillarId =
  | "P2-01"
  | "P2-02"
  | "P2-03"
  | "P2-04"
  | "P2-05"
  | "P2-06"
  | "P2-07"
  | "P2-08"
  | "P2-09"
  | "P2-10"
  | "P2-11"
  | "P2-12";

export type Phase2FeatureFlag =
  | "mobileApps"
  | "corporatePortal"
  | "multiTenant"
  | "aiProctoring"
  | "learningPaths"
  | "crmIntegration"
  | "erpIntegration"
  | "marketingAutomation"
  | "enterpriseSso"
  | "i18n"
  | "whiteLabel"
  | "biPredictive";

export interface Phase2Pillar {
  id: Phase2PillarId;
  title: string;
  flag: Phase2FeatureFlag;
  train: "2.0" | "2.1" | "2.2" | "2.3";
  docPath: string;
  summary: string;
}

export const PHASE2_PILLARS: Phase2Pillar[] = [
  {
    id: "P2-01",
    title: "Native mobile applications",
    flag: "mobileApps",
    train: "2.1",
    docPath: "docs/phase2/01-native-mobile.md",
    summary: "React Native iOS/Android — student & instructor apps, push, offline, biometrics.",
  },
  {
    id: "P2-02",
    title: "Corporate training portal",
    flag: "corporatePortal",
    train: "2.1",
    docPath: "docs/phase2/02-corporate-portal.md",
    summary: "Company accounts, departments, assignments, corporate billing & certificates.",
  },
  {
    id: "P2-03",
    title: "Multi-tenant SaaS architecture",
    flag: "multiTenant",
    train: "2.0",
    docPath: "docs/phase2/03-multi-tenant.md",
    summary: "Multiple academies, isolation, domains, independent billing & admins.",
  },
  {
    id: "P2-04",
    title: "AI proctoring",
    flag: "aiProctoring",
    train: "2.2",
    docPath: "docs/phase2/04-ai-proctoring.md",
    summary: "Face/tab monitoring and suspicious activity alerts for online exams.",
  },
  {
    id: "P2-05",
    title: "Advanced learning paths",
    flag: "learningPaths",
    train: "2.1",
    docPath: "docs/phase2/05-learning-paths.md",
    summary: "Prerequisites, career tracks, required/recommended courses, cert paths.",
  },
  {
    id: "P2-06",
    title: "CRM integration",
    flag: "crmIntegration",
    train: "2.2",
    docPath: "docs/phase2/06-crm-integration.md",
    summary: "HubSpot, Salesforce, Zoho, Dynamics — extensible connectors.",
  },
  {
    id: "P2-07",
    title: "ERP integration",
    flag: "erpIntegration",
    train: "2.3",
    docPath: "docs/phase2/07-erp-integration.md",
    summary: "SAP, Oracle, Business Central, Odoo finance/HR sync.",
  },
  {
    id: "P2-08",
    title: "Marketing automation",
    flag: "marketingAutomation",
    train: "2.2",
    docPath: "docs/phase2/08-marketing-automation.md",
    summary: "Campaigns, segmentation, referrals, affiliates.",
  },
  {
    id: "P2-09",
    title: "Enterprise SSO",
    flag: "enterpriseSso",
    train: "2.0",
    docPath: "docs/phase2/09-enterprise-sso.md",
    summary: "Google, Entra ID, Okta, Auth0, SAML, OAuth/OIDC.",
  },
  {
    id: "P2-10",
    title: "Multi-language platform",
    flag: "i18n",
    train: "2.2",
    docPath: "docs/phase2/10-i18n.md",
    summary: "Unlimited locales including Arabic RTL; English remains v1 default.",
  },
  {
    id: "P2-11",
    title: "White label solution",
    flag: "whiteLabel",
    train: "2.0",
    docPath: "docs/phase2/11-white-label.md",
    summary: "Per-academy logo, colors, domain, emails, landing pages.",
  },
  {
    id: "P2-12",
    title: "Business Intelligence 2.0",
    flag: "biPredictive",
    train: "2.3",
    docPath: "docs/phase2/12-bi-predictive.md",
    summary: "Predictive analytics, forecasting, retention & demand models.",
  },
];
