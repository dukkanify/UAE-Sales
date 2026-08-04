/**
 * Seed demo support-ops data for UAT / demos (Tasks 017 / 021).
 */

import { generateId } from "@/lib/security/crypto";
import { ensureSupportOpsStore, writeSupportOpsStore } from "@/services/support-ops/store";

const TARGET_SEED_VERSION = 2;

function applyV1Seed(db: ReturnType<typeof ensureSupportOpsStore>, iso: (h: number) => string) {
  db.releases = [
    {
      id: generateId(),
      version: "1.0.0",
      title: "Initial production release",
      summary: "ATPL PASS public launch with full learning, payments, and ops stack.",
      highlights: [
        "Role-based dashboards",
        "Live classes & quizzes",
        "Payments & instructor wallet",
        "AI assistant",
        "Production monitoring & backups",
      ],
      fixes: ["Instructor course list RBAC (Task 016)"],
      breakingChanges: [],
      deployedAt: iso(24),
      createdBy: null,
      createdAt: iso(48),
      updatedAt: iso(24),
    },
  ];

  db.roadmapItems = [
    {
      id: generateId(),
      title: "Supabase production cutover",
      description: "Migrate JSON stores to Postgres + Storage.",
      status: "approved",
      priority: "high",
      targetVersion: "1.1.0",
      changeRequestId: null,
      createdAt: iso(72),
      updatedAt: iso(24),
    },
    {
      id: generateId(),
      title: "Live Stripe + Zoom credentials",
      description: "Enable live payment and meeting integrations.",
      status: "planned",
      priority: "high",
      targetVersion: "1.1.0",
      changeRequestId: null,
      createdAt: iso(72),
      updatedAt: iso(72),
    },
    {
      id: generateId(),
      title: "WCAG accessibility hardening",
      description: "Full assistive-tech audit and remediation.",
      status: "planned",
      priority: "medium",
      targetVersion: "1.2.0",
      changeRequestId: null,
      createdAt: iso(48),
      updatedAt: iso(48),
    },
    {
      id: generateId(),
      title: "Airline partner SSO",
      description: "Enterprise SSO for airline training partners.",
      status: "deferred",
      priority: "low",
      targetVersion: "2.0.0",
      changeRequestId: null,
      createdAt: iso(96),
      updatedAt: iso(96),
    },
  ];

  db.bugs = [
    {
      id: generateId(),
      number: "BUG-0001",
      title: "Instructor GET /api/courses permission denied",
      description: "Instructors lacked COURSES_MANAGE; list required COURSES_OWN scope.",
      priority: "high",
      status: "closed",
      module: "courses",
      reporterId: null,
      assigneeId: null,
      resolution: "Allow COURSES_OWN and force instructorId filter.",
      verifiedAt: iso(20),
      closedAt: iso(18),
      createdAt: iso(30),
      updatedAt: iso(18),
      history: [
        { at: iso(30), actorId: null, note: "Opened from UAT" },
        { at: iso(22), actorId: null, from: "new", to: "confirmed", note: "Reproduced" },
        { at: iso(20), actorId: null, from: "in_progress", to: "verified", note: "UAT 28/28" },
        { at: iso(18), actorId: null, from: "verified", to: "closed", note: "Closed" },
      ],
    },
  ];
  db.counters.bug = 1;

  db.supportRequests = [
    {
      id: generateId(),
      number: "SUP-0001",
      subject: "Cannot join live class link",
      description: "Student reports Zoom join button inactive before start window.",
      category: "zoom",
      channel: "ticket",
      priority: "high",
      status: "in_progress",
      requesterEmail: "student.one@eagerpilots.com",
      requesterName: "Student One",
      assigneeId: null,
      firstResponseAt: iso(1),
      resolvedAt: null,
      slaBreached: false,
      linkedTicketId: null,
      createdAt: iso(3),
      updatedAt: iso(1),
      history: [{ at: iso(3), actorId: null, note: "Created via support channel" }],
    },
  ];
  db.counters.support = 1;

  db.changeRequests = [
    {
      id: generateId(),
      number: "CR-0001",
      description: "Add multi-school white-label branding packs",
      businessImpact: "Enables partner academies under ATPL PASS.",
      estimatedTimeHours: 80,
      estimatedCost: 12000,
      currency: "USD",
      approvalStatus: "pending",
      developmentStatus: "not_started",
      requestedBy: null,
      approvedBy: null,
      futurePhase: "2.0",
      createdAt: iso(40),
      updatedAt: iso(40),
    },
  ];
  db.counters.cr = 1;

  db.incidents = [];
  db.alerts = [];
  db.maintenanceLogs = [];
  db.healthLogs = [];
  db.backupReports = [];
  db.seeded = true;
  db.seedVersion = 1;
  db.sla.updatedAt = iso(1);
}

function applyV2Seed(db: ReturnType<typeof ensureSupportOpsStore>, iso: (h: number) => string) {
  if (!db.releases.some((r) => r.version === "1.0.1")) {
    db.releases.unshift({
      id: generateId(),
      version: "1.0.1",
      title: "Post-launch patch",
      summary: "Hypercare hardening, support workflow polish, and ops documentation.",
      highlights: ["Ops Center post-launch modules", "Configurable SLA confirmed"],
      fixes: ["Support triage docs aligned with SLA"],
      breakingChanges: [],
      deployedAt: iso(6),
      createdBy: null,
      createdAt: iso(12),
      updatedAt: iso(6),
    });
  }

  const v11Titles = [
    "Native mobile applications",
    "Microsoft Teams integration",
    "Google Meet integration",
    "AI proctoring",
    "Advanced exam security",
    "Multi-language support",
    "Multi-tenant architecture",
    "Advanced CRM integration",
    "Advanced marketing automation",
    "Enterprise reporting",
  ];
  for (const title of v11Titles) {
    if (db.roadmapItems.some((r) => r.title === title)) continue;
    db.roadmapItems.push({
      id: generateId(),
      title,
      description: `Planned for Version 1.1+ — ${title.toLowerCase()}.`,
      status: "planned",
      priority:
        title.includes("mobile") || title.includes("exam") || title.includes("Multi-tenant")
          ? "high"
          : "medium",
      targetVersion: "1.1.0",
      changeRequestId: null,
      createdAt: iso(2),
      updatedAt: iso(2),
    });
  }

  if (db.featureRequests.length === 0) {
    db.featureRequests = [
      {
        id: generateId(),
        number: "FEAT-0001",
        title: "Offline lesson packs",
        description: "Allow students to download lesson media for offline study.",
        businessValue: "Improves completion for students with limited connectivity.",
        priority: "medium",
        estimatedEffortHours: 120,
        estimatedCost: 18000,
        currency: "USD",
        approvalStatus: "pending",
        developmentStatus: "not_started",
        requestedBy: null,
        approvedBy: null,
        targetVersion: "1.1.0",
        createdAt: iso(8),
        updatedAt: iso(8),
      },
    ];
    db.counters.feature = Math.max(db.counters.feature, 1);
  }

  if (db.knowledgeArticles.length === 0) {
    db.knowledgeArticles = [
      {
        id: generateId(),
        slug: "faq-otp-login",
        title: "FAQ: OTP login not arriving",
        summary: "Check ESP configuration and demo OTP policy.",
        body: "Confirm email provider settings. In non-production, demo OTP 123456 may be enabled. Production must set ENABLE_DEMO_OTP=false.",
        category: "faq",
        audience: "all",
        published: true,
        tags: ["auth", "otp", "email"],
        updatedBy: null,
        createdAt: iso(10),
        updatedAt: iso(10),
      },
      {
        id: generateId(),
        slug: "troubleshoot-zoom-join",
        title: "Troubleshooting: Zoom join window",
        summary: "Join links activate near class start.",
        body: "Students may see an inactive join button until the scheduled start window. Verify class status and Zoom credentials.",
        category: "troubleshooting",
        audience: "instructor",
        published: true,
        tags: ["zoom", "live-class"],
        updatedBy: null,
        createdAt: iso(10),
        updatedAt: iso(10),
      },
      {
        id: generateId(),
        slug: "admin-backup-restore",
        title: "Administrator: Backup & restore",
        summary: "Run backup and integrity-test restore from Ops Center.",
        body: "Use System logs or Ops Center → Backups. Always run test_restore before a live restore. See docs/BACKUP_DISASTER_RECOVERY.md.",
        category: "admin_guide",
        audience: "admin",
        published: true,
        tags: ["backup", "ops"],
        updatedBy: null,
        createdAt: iso(10),
        updatedAt: iso(10),
      },
      {
        id: generateId(),
        slug: "best-practice-hypercare",
        title: "Best practice: Hypercare check-ins",
        summary: "Daily stability notes during the first post-launch weeks.",
        body: "Enable hypercare, watch critical modules, and log check-ins with open critical/high counts. Escalate per SLA.",
        category: "best_practices",
        audience: "internal",
        published: true,
        tags: ["hypercare", "sla"],
        updatedBy: null,
        createdAt: iso(4),
        updatedAt: iso(4),
      },
    ];
  }

  if (db.feedback.length === 0) {
    db.feedback = [
      {
        id: generateId(),
        category: "satisfaction",
        rating: 5,
        title: "Smooth onboarding",
        comment: "Student dashboard and course enroll flow felt clear.",
        submitterEmail: "student.one@eagerpilots.com",
        submitterRole: "student",
        linkedFeatureId: null,
        linkedBugId: null,
        status: "reviewed",
        createdAt: iso(5),
        updatedAt: iso(5),
      },
      {
        id: generateId(),
        category: "improvement",
        rating: 4,
        title: "Calendar filters",
        comment: "Would like filters by subject on the live class calendar.",
        submitterEmail: "instructor.one@eagerpilots.com",
        submitterRole: "instructor",
        linkedFeatureId: null,
        linkedBugId: null,
        status: "new",
        createdAt: iso(3),
        updatedAt: iso(3),
      },
    ];
  }

  if (db.optimizationNotes.length === 0) {
    db.optimizationNotes = [
      {
        id: generateId(),
        area: "api",
        title: "Deep health cache",
        finding: "Deep health previously repeated expensive checks on each Ops poll.",
        recommendedAction:
          "Keep short in-process cache; snapshot via capture_health on a schedule.",
        status: "done",
        createdAt: iso(20),
        updatedAt: iso(20),
      },
      {
        id: generateId(),
        area: "dashboard",
        title: "Dashboard metrics latency",
        finding: "UAT enforces dashboard API latency budget.",
        recommendedAction:
          "Monitor /api/dashboard/metrics under load; paginate heavy analytics exports.",
        status: "in_progress",
        createdAt: iso(2),
        updatedAt: iso(2),
      },
      {
        id: generateId(),
        area: "database",
        title: "Supabase index pass",
        finding: "JSON store fine for single-node; multi-instance needs Postgres indexes.",
        recommendedAction: "Apply migrations 002–016 and review hot-path indexes before cutover.",
        status: "open",
        createdAt: iso(2),
        updatedAt: iso(2),
      },
    ];
  }

  if (!db.hypercare.enabled && !db.hypercare.startedAt) {
    db.hypercare = {
      enabled: true,
      label: "v1.0 hypercare window",
      startedAt: iso(48),
      endsAt: new Date(Date.now() + 14 * 24 * 3600_000).toISOString(),
      notes: "Intensive monitoring after production launch. Prioritize critical/high defects.",
      watchModules: ["auth", "courses", "live_classes", "payments", "zoom", "email", "api", "jobs"],
      checkIns: [
        {
          id: generateId(),
          at: iso(2),
          actorId: null,
          summary: "Launch+2d check-in: platform stable, one Zoom support ticket in progress.",
          stability: "stable",
          openCritical: 0,
          openHigh: 1,
          notes: "Continue watching payment webhook volume.",
        },
      ],
      updatedAt: iso(2),
    };
  }

  if (db.incidents.length === 0) {
    db.incidents = [
      {
        id: generateId(),
        number: "INC-0001",
        title: "Elevated OTP request rate (staging)",
        summary: "Rate limiter tripped during UAT storm; no production impact.",
        severity: "low",
        status: "closed",
        affectedModule: "auth",
        affectedServices: ["auth", "api"],
        rootCause: "Automated UAT retried OTP against production-mode server without demo OTP.",
        resolution: "Restarted development server; cleared in-memory rate limits.",
        preventiveAction: "Document NODE_ENV=production disables demo OTP; UAT uses next dev.",
        startedAt: iso(40),
        resolvedAt: iso(38),
        postmortem: "No data loss. Added runbook note in post-launch support docs.",
        createdBy: null,
        createdAt: iso(40),
        updatedAt: iso(38),
      },
    ];
    db.counters.incident = Math.max(db.counters.incident, 1);
  }

  db.seedVersion = TARGET_SEED_VERSION;
  db.seeded = true;
}

export function ensureSupportOpsSeeded() {
  const db = ensureSupportOpsStore();
  const now = new Date();
  const iso = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600_000).toISOString();

  if (!db.seeded) {
    applyV1Seed(db, iso);
  }
  if ((db.seedVersion ?? 0) < TARGET_SEED_VERSION) {
    applyV2Seed(db, iso);
  }
  writeSupportOpsStore(db);
  return db;
}
