/**
 * Seed demo support-ops data for UAT / demos.
 */

import { generateId } from "@/lib/security/crypto";
import {
  ensureSupportOpsStore,
  writeSupportOpsStore,
} from "@/services/support-ops/store";

export function ensureSupportOpsSeeded() {
  const db = ensureSupportOpsStore();
  if (db.seeded) return db;

  const now = new Date();
  const iso = (hoursAgo: number) =>
    new Date(now.getTime() - hoursAgo * 3600_000).toISOString();

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
  db.sla.updatedAt = iso(1);
  writeSupportOpsStore(db);
  return db;
}
