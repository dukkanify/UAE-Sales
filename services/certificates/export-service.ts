/**
 * Export helpers — CSV / Excel-friendly CSV / print HTML / PDF-ready HTML.
 */

import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import { generateTranscript } from "@/services/certificates/transcript-service";
import { renderCertificateHtml } from "@/services/certificates/certificate-service";
import {
  getAdminReport,
  getExecutiveReport,
  getInstructorReport,
} from "@/services/certificates/reporting-service";
import type { UserProfile } from "@/types";

function csvEscape(value: unknown): string {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function exportTranscriptCsv(actor: UserProfile, studentId: string): Promise<string> {
  const t = await generateTranscript(actor, studentId);
  const lines = [
    "courseCode,courseTitle,progressPercent,completed,learningHours,quizAverage,certificateNumber",
    ...t.courses.map((c) =>
      [
        c.code,
        c.courseTitle,
        c.progressPercent,
        c.completed,
        c.learningHours,
        c.quizAverage ?? "",
        c.certificateNumber ?? "",
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];
  await logActivity({
    actorId: actor.id,
    action: ACTIVITY_ACTIONS.REPORT_EXPORTED,
    entityType: "transcript",
    entityId: studentId,
    metadata: { format: "csv" },
  });
  return lines.join("\n");
}

export async function exportTranscriptHtml(
  actor: UserProfile,
  studentId: string,
): Promise<string> {
  const t = await generateTranscript(actor, studentId);
  const rows = t.courses
    .map(
      (c) =>
        `<tr><td>${c.code}</td><td>${c.courseTitle}</td><td>${c.progressPercent}%</td><td>${c.learningHours}h</td><td>${c.quizAverage ?? "—"}</td><td>${c.certificateNumber ?? "—"}</td></tr>`,
    )
    .join("");
  await logActivity({
    actorId: actor.id,
    action: ACTIVITY_ACTIONS.REPORT_EXPORTED,
    entityType: "transcript",
    entityId: studentId,
    metadata: { format: "pdf_html" },
  });
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Transcript — ${t.studentName}</title>
<style>
body{font-family:system-ui,sans-serif;padding:32px;color:#0b1f33}
h1{font-size:28px;margin:0}
table{width:100%;border-collapse:collapse;margin-top:24px}
th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
th{background:#f5f5f5}
@media print{button{display:none}}
</style></head><body>
<button onclick="window.print()">Print / Save PDF</button>
<h1>Academic Transcript</h1>
<p>${t.studentName} · ${t.studentEmail}</p>
<p>Generated ${new Date(t.generatedAt).toLocaleString()} · Overall ${t.overallPerformance} · ${t.learningHours}h · Attendance ${t.attendanceRate}%</p>
<table><thead><tr><th>Code</th><th>Course</th><th>Progress</th><th>Hours</th><th>Quiz Avg</th><th>Certificate</th></tr></thead>
<tbody>${rows}</tbody></table>
<h2>Certificates</h2>
<ul>${t.certificates.map((c) => `<li>${c.certificateNumber} — ${c.courseName} (${c.status})</li>`).join("")}</ul>
</body></html>`;
}

export async function exportCertificatePrintHtml(certificateId: string): Promise<string> {
  const { html } = await renderCertificateHtml(certificateId);
  return html;
}

export async function exportAdminReportCsv(actor: UserProfile): Promise<string> {
  const r = getAdminReport();
  await logActivity({
    actorId: actor.id,
    action: ACTIVITY_ACTIONS.REPORT_EXPORTED,
    entityType: "admin_report",
    entityId: "platform",
    metadata: { format: "csv" },
  });
  return [
    "metric,value",
    ...Object.entries(r).map(([k, v]) => `${csvEscape(k)},${csvEscape(v)}`),
  ].join("\n");
}

export async function exportExecutiveReportCsv(actor: UserProfile): Promise<string> {
  const r = getExecutiveReport();
  await logActivity({
    actorId: actor.id,
    action: ACTIVITY_ACTIONS.REPORT_EXPORTED,
    entityType: "executive_report",
    entityId: "platform",
    metadata: { format: "csv" },
  });
  const lines = [
    "metric,value",
    `totalGraduates,${r.totalGraduates}`,
    `certificatesIssued,${r.certificatesIssued}`,
    `activeStudents,${r.activeStudents}`,
    `courseSuccessRate,${r.courseSuccessRate}`,
    `learningHours,${r.platformEngagement.learningHours}`,
    `quizAttempts,${r.platformEngagement.quizAttempts}`,
  ];
  return lines.join("\n");
}

export async function exportInstructorReportCsv(
  actor: UserProfile,
  instructorId: string,
): Promise<string> {
  const r = getInstructorReport(instructorId);
  await logActivity({
    actorId: actor.id,
    action: ACTIVITY_ACTIONS.REPORT_EXPORTED,
    entityType: "instructor_report",
    entityId: instructorId,
    metadata: { format: "csv" },
  });
  const header =
    "studentId,studentName,progressPercent,quizAverage,certificates,lastActivityAt";
  const rows = r.studentRows.map((s) =>
    [
      s.studentId,
      s.studentName,
      s.progressPercent,
      s.quizAverage,
      s.certificates,
      s.lastActivityAt ?? "",
    ]
      .map(csvEscape)
      .join(","),
  );
  return [header, ...rows].join("\n");
}
