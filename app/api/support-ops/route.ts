import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { enforceMutatingApiSecurity } from "@/lib/security/api-guard";
import { authErrorResponse, getRequestContext, requirePermission } from "@/services/auth/guards";
import { updatePlatformSettings } from "@/services/settings/settings-service";
import {
  acknowledgeAlert,
  addHypercareCheckIn,
  captureHealthLog,
  createBug,
  createChangeRequest,
  createFeatureRequest,
  createFeedback,
  createIncident,
  createKnowledgeArticle,
  createOptimizationNote,
  createRelease,
  createRoadmapItem,
  createSupportRequest,
  generateBackupReport,
  getFeedbackMonthlySummary,
  getHypercare,
  getMaintenanceDashboard,
  getSlaPolicy,
  getSupportOpsSummary,
  getSystemHealthDashboard,
  listAlerts,
  listBackupReports,
  listBugs,
  listChangeRequests,
  listFeatureRequests,
  listFeedback,
  listHealthLogs,
  listIncidents,
  listKnowledgeArticles,
  listMaintenanceLogs,
  listOptimizationNotes,
  listReleases,
  listRoadmapItems,
  listSupportRequests,
  logMaintenanceChange,
  markReleaseDeployed,
  resolveAlert,
  updateBug,
  updateChangeRequest,
  updateFeatureRequest,
  updateFeedback,
  updateHypercare,
  updateIncident,
  updateKnowledgeArticle,
  updateOptimizationNote,
  updateRoadmapItem,
  updateSlaPolicy,
  updateSupportRequest,
} from "@/services/support-ops";
import type {
  AlertStatus,
  BugStatus,
  ChangeRequest,
  CustomerFeedback,
  DevelopmentStatus,
  FeatureApprovalStatus,
  IncidentStatus,
  KnowledgeAudience,
  KnowledgeCategory,
  OptimizationNote,
  RoadmapStatus,
  SupportPriority,
  SupportRequest,
  SupportRequestStatus,
} from "@/types/support-ops";

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.AUDIT_READ);
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "dashboard";

    switch (view) {
      case "dashboard":
        return NextResponse.json({
          success: true,
          data: getSystemHealthDashboard(),
          error: null,
        });
      case "summary":
        return NextResponse.json({ success: true, data: getSupportOpsSummary(), error: null });
      case "sla":
        return NextResponse.json({ success: true, data: getSlaPolicy(), error: null });
      case "support":
        return NextResponse.json({
          success: true,
          data: listSupportRequests({
            status: (searchParams.get("status") as SupportRequestStatus | "all") || "all",
            priority: (searchParams.get("priority") as SupportPriority | "all") || "all",
            category: searchParams.get("category") ?? "all",
            q: searchParams.get("q") ?? undefined,
          }),
          error: null,
        });
      case "bugs":
        return NextResponse.json({
          success: true,
          data: listBugs({
            status: (searchParams.get("status") as BugStatus | "all") || "all",
            priority: (searchParams.get("priority") as SupportPriority | "all") || "all",
            q: searchParams.get("q") ?? undefined,
          }),
          error: null,
        });
      case "change-requests":
        return NextResponse.json({ success: true, data: listChangeRequests(), error: null });
      case "releases":
        return NextResponse.json({ success: true, data: listReleases(), error: null });
      case "roadmap":
        return NextResponse.json({
          success: true,
          data: listRoadmapItems((searchParams.get("status") as RoadmapStatus | "all") || "all"),
          error: null,
        });
      case "incidents":
        return NextResponse.json({ success: true, data: listIncidents(), error: null });
      case "alerts":
        return NextResponse.json({
          success: true,
          data: listAlerts((searchParams.get("status") as AlertStatus | "all") || "all"),
          error: null,
        });
      case "maintenance-logs":
        return NextResponse.json({ success: true, data: listMaintenanceLogs(), error: null });
      case "health-logs":
        return NextResponse.json({
          success: true,
          data: listHealthLogs(Number(searchParams.get("limit") ?? 50)),
          error: null,
        });
      case "backup-reports":
        return NextResponse.json({ success: true, data: listBackupReports(), error: null });
      case "hypercare":
        return NextResponse.json({ success: true, data: getHypercare(), error: null });
      case "features":
        return NextResponse.json({
          success: true,
          data: listFeatureRequests({
            approvalStatus:
              (searchParams.get("approvalStatus") as FeatureApprovalStatus | "all") || "all",
            priority: (searchParams.get("priority") as SupportPriority | "all") || "all",
            q: searchParams.get("q") ?? undefined,
          }),
          error: null,
        });
      case "knowledge":
        return NextResponse.json({
          success: true,
          data: listKnowledgeArticles({
            category: (searchParams.get("category") as KnowledgeCategory | "all") || "all",
            audience: (searchParams.get("audience") as KnowledgeAudience | "all") || "all",
            published:
              searchParams.get("published") === "true"
                ? true
                : searchParams.get("published") === "false"
                  ? false
                  : "all",
            q: searchParams.get("q") ?? undefined,
          }),
          error: null,
        });
      case "feedback":
        return NextResponse.json({
          success: true,
          data: listFeedback({
            category:
              (searchParams.get("category") as CustomerFeedback["category"] | "all") || "all",
            status: (searchParams.get("status") as CustomerFeedback["status"] | "all") || "all",
          }),
          error: null,
        });
      case "feedback-summary":
        return NextResponse.json({
          success: true,
          data: getFeedbackMonthlySummary(searchParams.get("month") ?? undefined),
          error: null,
        });
      case "optimization":
        return NextResponse.json({
          success: true,
          data: listOptimizationNotes(
            (searchParams.get("status") as OptimizationNote["status"] | "all") || "all",
          ),
          error: null,
        });
      case "maintenance-dashboard":
        return NextResponse.json({
          success: true,
          data: getMaintenanceDashboard(),
          error: null,
        });
      default:
        return NextResponse.json(
          { success: false, data: null, error: `Unknown view: ${view}` },
          { status: 400 },
        );
    }
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const blocked = await enforceMutatingApiSecurity(request);
    if (blocked) return blocked;

    const user = await requirePermission(PERMISSIONS.SYSTEM_SETTINGS);
    const ctx = getRequestContext(request);
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body?.action) {
      return NextResponse.json(
        { success: false, data: null, error: "action required" },
        { status: 400 },
      );
    }

    const action = String(body.action);

    switch (action) {
      case "update_sla": {
        const data = updateSlaPolicy(
          {
            critical: body.critical as
              { responseHours: number; resolutionHours: number } | undefined,
            high: body.high as { responseHours: number; resolutionHours: number } | undefined,
            medium: body.medium as { responseHours: number; resolutionHours: number } | undefined,
            low: body.low as { responseHours: number; resolutionHours: number } | undefined,
          },
          user.id,
        );
        return NextResponse.json({ success: true, data, error: null });
      }
      case "create_support": {
        const data = createSupportRequest({
          subject: String(body.subject ?? ""),
          description: String(body.description ?? ""),
          category: (body.category as SupportRequest["category"]) || "general",
          channel: (body.channel as SupportRequest["channel"]) || "admin_report",
          priority: (body.priority as SupportPriority) || "medium",
          requesterEmail: String(body.requesterEmail ?? user.email),
          requesterName: String(body.requesterName ?? user.fullName ?? user.email),
          actorId: user.id,
        });
        return NextResponse.json({ success: true, data, error: null }, { status: 201 });
      }
      case "update_support": {
        const data = updateSupportRequest(
          String(body.id),
          {
            status: body.status as SupportRequestStatus | undefined,
            priority: body.priority as SupportPriority | undefined,
            assigneeId: body.assigneeId != null ? String(body.assigneeId) : undefined,
            note: body.note != null ? String(body.note) : undefined,
          },
          user.id,
        );
        return NextResponse.json({ success: true, data, error: null });
      }
      case "create_bug": {
        const data = createBug({
          title: String(body.title ?? ""),
          description: String(body.description ?? ""),
          priority: (body.priority as SupportPriority) || "medium",
          module: String(body.module ?? "general"),
          reporterId: user.id,
        });
        return NextResponse.json({ success: true, data, error: null }, { status: 201 });
      }
      case "update_bug": {
        const data = updateBug(
          String(body.id),
          {
            status: body.status as BugStatus | undefined,
            priority: body.priority as SupportPriority | undefined,
            assigneeId: body.assigneeId != null ? String(body.assigneeId) : undefined,
            resolution: body.resolution != null ? String(body.resolution) : undefined,
            note: body.note != null ? String(body.note) : undefined,
          },
          user.id,
        );
        return NextResponse.json({ success: true, data, error: null });
      }
      case "create_cr": {
        const data = createChangeRequest({
          description: String(body.description ?? ""),
          businessImpact: String(body.businessImpact ?? ""),
          estimatedTimeHours:
            body.estimatedTimeHours != null ? Number(body.estimatedTimeHours) : null,
          estimatedCost: body.estimatedCost != null ? Number(body.estimatedCost) : null,
          currency: body.currency != null ? String(body.currency) : "USD",
          requestedBy: user.id,
          futurePhase: body.futurePhase != null ? String(body.futurePhase) : null,
        });
        return NextResponse.json({ success: true, data, error: null }, { status: 201 });
      }
      case "update_cr": {
        const data = updateChangeRequest(
          String(body.id),
          {
            approvalStatus: body.approvalStatus as ChangeRequest["approvalStatus"] | undefined,
            developmentStatus: body.developmentStatus as DevelopmentStatus | undefined,
            estimatedTimeHours:
              body.estimatedTimeHours != null ? Number(body.estimatedTimeHours) : undefined,
            estimatedCost: body.estimatedCost != null ? Number(body.estimatedCost) : undefined,
            futurePhase: body.futurePhase != null ? String(body.futurePhase) : undefined,
          },
          user.id,
        );
        return NextResponse.json({ success: true, data, error: null });
      }
      case "create_release": {
        const data = createRelease({
          version: String(body.version ?? ""),
          title: String(body.title ?? ""),
          summary: String(body.summary ?? ""),
          highlights: Array.isArray(body.highlights) ? body.highlights.map(String) : [],
          fixes: Array.isArray(body.fixes) ? body.fixes.map(String) : [],
          breakingChanges: Array.isArray(body.breakingChanges)
            ? body.breakingChanges.map(String)
            : [],
          deployedAt: body.deployedAt != null ? String(body.deployedAt) : null,
          createdBy: user.id,
        });
        return NextResponse.json({ success: true, data, error: null }, { status: 201 });
      }
      case "deploy_release": {
        const data = markReleaseDeployed(
          String(body.id),
          body.deployedAt ? String(body.deployedAt) : undefined,
        );
        return NextResponse.json({ success: true, data, error: null });
      }
      case "create_roadmap": {
        const data = createRoadmapItem({
          title: String(body.title ?? ""),
          description: String(body.description ?? ""),
          status: body.status as RoadmapStatus | undefined,
          priority: body.priority as SupportPriority | undefined,
          targetVersion: body.targetVersion != null ? String(body.targetVersion) : null,
        });
        return NextResponse.json({ success: true, data, error: null }, { status: 201 });
      }
      case "update_roadmap": {
        const data = updateRoadmapItem(String(body.id), {
          status: body.status as RoadmapStatus | undefined,
          priority: body.priority as SupportPriority | undefined,
          targetVersion: body.targetVersion != null ? String(body.targetVersion) : undefined,
          title: body.title != null ? String(body.title) : undefined,
          description: body.description != null ? String(body.description) : undefined,
        });
        return NextResponse.json({ success: true, data, error: null });
      }
      case "create_incident": {
        const data = createIncident({
          title: String(body.title ?? ""),
          summary: String(body.summary ?? ""),
          severity: (body.severity as SupportPriority) || "high",
          affectedModule: body.affectedModule != null ? String(body.affectedModule) : "general",
          affectedServices: Array.isArray(body.affectedServices)
            ? body.affectedServices.map(String)
            : [],
          rootCause: body.rootCause != null ? String(body.rootCause) : null,
          resolution: body.resolution != null ? String(body.resolution) : null,
          preventiveAction: body.preventiveAction != null ? String(body.preventiveAction) : null,
          createdBy: user.id,
        });
        return NextResponse.json({ success: true, data, error: null }, { status: 201 });
      }
      case "update_incident": {
        const data = updateIncident(String(body.id), {
          status: body.status as IncidentStatus | undefined,
          postmortem: body.postmortem != null ? String(body.postmortem) : undefined,
          summary: body.summary != null ? String(body.summary) : undefined,
          rootCause: body.rootCause != null ? String(body.rootCause) : undefined,
          resolution: body.resolution != null ? String(body.resolution) : undefined,
          preventiveAction:
            body.preventiveAction != null ? String(body.preventiveAction) : undefined,
          affectedModule: body.affectedModule != null ? String(body.affectedModule) : undefined,
        });
        return NextResponse.json({ success: true, data, error: null });
      }
      case "update_hypercare": {
        const data = updateHypercare({
          enabled: body.enabled != null ? Boolean(body.enabled) : undefined,
          label: body.label != null ? String(body.label) : undefined,
          startedAt: body.startedAt != null ? String(body.startedAt) : undefined,
          endsAt: body.endsAt != null ? String(body.endsAt) : undefined,
          notes: body.notes != null ? String(body.notes) : undefined,
          watchModules: Array.isArray(body.watchModules)
            ? body.watchModules.map(String)
            : undefined,
        });
        return NextResponse.json({ success: true, data, error: null });
      }
      case "hypercare_checkin": {
        const data = addHypercareCheckIn({
          summary: String(body.summary ?? ""),
          stability: (body.stability as "stable" | "degraded" | "critical") || "stable",
          openCritical: body.openCritical != null ? Number(body.openCritical) : undefined,
          openHigh: body.openHigh != null ? Number(body.openHigh) : undefined,
          notes: body.notes != null ? String(body.notes) : undefined,
          actorId: user.id,
        });
        return NextResponse.json({ success: true, data, error: null }, { status: 201 });
      }
      case "create_feature": {
        const data = createFeatureRequest({
          title: String(body.title ?? ""),
          description: String(body.description ?? ""),
          businessValue: String(body.businessValue ?? ""),
          priority: (body.priority as SupportPriority) || "medium",
          estimatedEffortHours:
            body.estimatedEffortHours != null ? Number(body.estimatedEffortHours) : null,
          estimatedCost: body.estimatedCost != null ? Number(body.estimatedCost) : null,
          currency: body.currency != null ? String(body.currency) : "USD",
          targetVersion: body.targetVersion != null ? String(body.targetVersion) : null,
          requestedBy: user.id,
        });
        return NextResponse.json({ success: true, data, error: null }, { status: 201 });
      }
      case "update_feature": {
        const data = updateFeatureRequest(
          String(body.id),
          {
            title: body.title != null ? String(body.title) : undefined,
            description: body.description != null ? String(body.description) : undefined,
            businessValue: body.businessValue != null ? String(body.businessValue) : undefined,
            priority: body.priority as SupportPriority | undefined,
            estimatedEffortHours:
              body.estimatedEffortHours != null ? Number(body.estimatedEffortHours) : undefined,
            estimatedCost: body.estimatedCost != null ? Number(body.estimatedCost) : undefined,
            approvalStatus: body.approvalStatus as FeatureApprovalStatus | undefined,
            developmentStatus: body.developmentStatus as DevelopmentStatus | undefined,
            targetVersion: body.targetVersion != null ? String(body.targetVersion) : undefined,
          },
          user.id,
        );
        return NextResponse.json({ success: true, data, error: null });
      }
      case "create_knowledge": {
        const data = createKnowledgeArticle({
          title: String(body.title ?? ""),
          summary: String(body.summary ?? ""),
          body: String(body.body ?? ""),
          category: (body.category as KnowledgeCategory) || "faq",
          audience: (body.audience as KnowledgeAudience) || "internal",
          published: body.published != null ? Boolean(body.published) : true,
          tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
          updatedBy: user.id,
        });
        return NextResponse.json({ success: true, data, error: null }, { status: 201 });
      }
      case "update_knowledge": {
        const data = updateKnowledgeArticle(
          String(body.id),
          {
            title: body.title != null ? String(body.title) : undefined,
            summary: body.summary != null ? String(body.summary) : undefined,
            body: body.body != null ? String(body.body) : undefined,
            category: body.category as KnowledgeCategory | undefined,
            audience: body.audience as KnowledgeAudience | undefined,
            published: body.published != null ? Boolean(body.published) : undefined,
            tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
          },
          user.id,
        );
        return NextResponse.json({ success: true, data, error: null });
      }
      case "create_feedback": {
        const data = createFeedback({
          category: (body.category as CustomerFeedback["category"]) || "comment",
          title: String(body.title ?? ""),
          comment: String(body.comment ?? ""),
          rating: body.rating != null ? Number(body.rating) : null,
          submitterEmail: body.submitterEmail != null ? String(body.submitterEmail) : user.email,
          submitterRole: body.submitterRole != null ? String(body.submitterRole) : user.role,
        });
        return NextResponse.json({ success: true, data, error: null }, { status: 201 });
      }
      case "update_feedback": {
        const data = updateFeedback(String(body.id), {
          status: body.status as CustomerFeedback["status"] | undefined,
          linkedFeatureId: body.linkedFeatureId != null ? String(body.linkedFeatureId) : undefined,
          linkedBugId: body.linkedBugId != null ? String(body.linkedBugId) : undefined,
        });
        return NextResponse.json({ success: true, data, error: null });
      }
      case "create_optimization": {
        const data = createOptimizationNote({
          area: (body.area as OptimizationNote["area"]) || "api",
          title: String(body.title ?? ""),
          finding: String(body.finding ?? ""),
          recommendedAction: String(body.recommendedAction ?? body.finding ?? ""),
          status: (body.status as OptimizationNote["status"]) || "open",
        });
        return NextResponse.json({ success: true, data, error: null }, { status: 201 });
      }
      case "update_optimization": {
        const data = updateOptimizationNote(String(body.id), {
          status: body.status as OptimizationNote["status"] | undefined,
          recommendedAction:
            body.recommendedAction != null ? String(body.recommendedAction) : undefined,
          finding: body.finding != null ? String(body.finding) : undefined,
          title: body.title != null ? String(body.title) : undefined,
        });
        return NextResponse.json({ success: true, data, error: null });
      }
      case "ack_alert": {
        return NextResponse.json({
          success: true,
          data: acknowledgeAlert(String(body.id)),
          error: null,
        });
      }
      case "resolve_alert": {
        return NextResponse.json({
          success: true,
          data: resolveAlert(String(body.id)),
          error: null,
        });
      }
      case "capture_health": {
        return NextResponse.json({ success: true, data: captureHealthLog(), error: null });
      }
      case "backup_report": {
        const data = generateBackupReport({
          period: (body.period as "daily" | "weekly" | "monthly" | "ad_hoc") || "ad_hoc",
          backupId: body.backupId != null ? String(body.backupId) : undefined,
          generatedBy: user.id,
          runRestoreTest: Boolean(body.runRestoreTest),
        });
        return NextResponse.json({ success: true, data, error: null });
      }
      case "set_maintenance": {
        const enabled = Boolean(body.enabled);
        const statusMessage = String(
          body.statusMessage ??
            "ATPL PASS is undergoing scheduled maintenance. Please check again shortly.",
        );
        const estimatedReturnAt =
          body.estimatedReturnAt != null ? String(body.estimatedReturnAt) : null;
        await updatePlatformSettings({
          patch: {
            general: {
              maintenanceMode: enabled,
              platformStatus: enabled ? "maintenance" : "online",
            },
          },
          actorId: user.id,
          ...ctx,
        });
        const data = logMaintenanceChange({
          enabled,
          statusMessage,
          estimatedReturnAt,
          contactEmail: body.contactEmail != null ? String(body.contactEmail) : undefined,
          contactPhone: body.contactPhone != null ? String(body.contactPhone) : undefined,
          actorId: user.id,
        });
        return NextResponse.json({ success: true, data, error: null });
      }
      default:
        return NextResponse.json(
          { success: false, data: null, error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    return authErrorResponse(error);
  }
}
