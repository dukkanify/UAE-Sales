import { NextResponse } from "next/server";
import { existsSync, readFileSync, statSync } from "fs";
import path from "path";

import { requireAuth, authErrorResponse } from "@/services/auth/guards";
import { verifyDownloadToken } from "@/lib/security/signed-url";
import { writeOpsLog } from "@/services/ops/logging-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const token = new URL(request.url).searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { success: false, data: null, error: "token required" },
        { status: 400 },
      );
    }
    const verified = verifyDownloadToken(token);
    if (!verified || verified.userId !== user.id) {
      writeOpsLog({
        level: "warn",
        category: "security",
        message: "Invalid download token",
        userId: user.id,
      });
      return NextResponse.json(
        { success: false, data: null, error: "Invalid or expired token" },
        { status: 403 },
      );
    }

    const root = path.join(process.cwd(), "public", "uploads");
    const abs = path.join(root, verified.path);
    if (!abs.startsWith(root) || !existsSync(abs)) {
      return NextResponse.json(
        { success: false, data: null, error: "File not found" },
        { status: 404 },
      );
    }

    const stat = statSync(abs);
    const buffer = readFileSync(abs);

    writeOpsLog({
      level: "info",
      category: "security",
      message: `Secure download ${verified.path}`,
      userId: user.id,
      path: verified.path,
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": String(stat.size),
        "Content-Disposition": `attachment; filename="${path.basename(verified.path)}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
