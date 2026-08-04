import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requirePermission } from "@/services/auth/guards";
import {
  exportQuestionsJson,
} from "@/services/quizzes/question-bank-service";
import {
  importQuestionRows,
  mapPilot100Payload,
  parseCsvQuestions,
  type ImportQuestionRow,
} from "@/services/quizzes/import-service";
import { ensureQuizzesSeeded } from "@/services/quizzes/seed";
import { quizErrorResponse } from "@/app/api/quizzes/_utils";

export async function GET(request: Request) {
  try {
    ensureQuizzesSeeded();
    await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") ?? "json";
    const data = exportQuestionsJson({
      q: searchParams.get("q") ?? undefined,
      type: (searchParams.get("type") as never) ?? "all",
    });
    if (format === "csv") {
      const header =
        "stem,type,difficulty,subject,moduleLabel,tags,options,correctAnswer,explanation,points,externalId,externalSource";
      const lines = data.map((q) =>
        [
          JSON.stringify(q.stem),
          q.type,
          q.difficulty,
          JSON.stringify(q.subject),
          JSON.stringify(q.moduleLabel),
          JSON.stringify(q.tags.join("|")),
          JSON.stringify(JSON.stringify(q.options)),
          JSON.stringify(JSON.stringify(q.correctAnswer)),
          JSON.stringify(q.explanation),
          q.points,
          q.externalId ?? "",
          q.externalSource ?? "",
        ].join(","),
      );
      return new NextResponse([header, ...lines].join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="question-bank.csv"',
        },
      });
    }
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensureQuizzesSeeded();
    const user = await requirePermission(PERMISSIONS.QUIZZES_MANAGE);
    const contentType = request.headers.get("content-type") ?? "";
    let rows: ImportQuestionRow[] = [];
    let source = "api";

    if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
      const csv = await request.text();
      rows = parseCsvQuestions(csv);
      source = "csv";
    } else {
      const body = (await request.json().catch(() => null)) as {
        format?: string;
        rows?: ImportQuestionRow[];
        csv?: string;
        pilot100?: unknown;
        source?: string;
      } | null;
      if (!body) {
        return NextResponse.json(
          { success: false, data: null, error: "Body required" },
          { status: 400 },
        );
      }
      source = body.source ?? body.format ?? "api";
      if (body.format === "pilot100" || body.pilot100) {
        rows = mapPilot100Payload(body.pilot100 ?? body.rows);
        source = "pilot100";
      } else if (body.csv) {
        rows = parseCsvQuestions(body.csv);
        source = "csv";
      } else if (Array.isArray(body.rows)) {
        rows = body.rows;
        source = body.format === "excel" ? "excel" : source;
      } else {
        return NextResponse.json(
          { success: false, data: null, error: "Provide rows, csv, or pilot100 payload" },
          { status: 400 },
        );
      }
    }

    const data = await importQuestionRows({ user, rows, source });
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return quizErrorResponse(error);
  }
}
