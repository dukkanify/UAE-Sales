/**
 * Upload validation — MIME allowlist, size limits, extension checks.
 * Virus scan hook is future-ready (noop stub).
 */

import path from "path";

export class UploadSecurityError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "UploadSecurityError";
    this.status = status;
  }
}

const DEFAULT_ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "video/mp4",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

/** SVG is blocked by default (scriptable). Opt-in only for branding with sanitization. */
const DANGEROUS = new Set(["image/svg+xml", "text/html", "application/javascript"]);

export interface UploadValidationInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  maxBytes?: number;
  allowedMimeTypes?: string[];
  allowSvg?: boolean;
}

export function validateUpload(input: UploadValidationInput): {
  safeName: string;
  mimeType: string;
} {
  const max = input.maxBytes ?? 10 * 1024 * 1024;
  if (!input.fileName?.trim()) throw new UploadSecurityError("File name required");
  if (input.sizeBytes <= 0) throw new UploadSecurityError("Empty file rejected");
  if (input.sizeBytes > max) {
    throw new UploadSecurityError(`File exceeds limit of ${Math.round(max / 1024 / 1024)}MB`);
  }

  const mime = (input.mimeType || "").toLowerCase().split(";")[0]!.trim();
  if (!mime) throw new UploadSecurityError("MIME type required");

  if (DANGEROUS.has(mime) && !(input.allowSvg && mime === "image/svg+xml")) {
    throw new UploadSecurityError(`MIME type ${mime} is not allowed`);
  }

  const allow = new Set(input.allowedMimeTypes ?? [...DEFAULT_ALLOWED]);
  if (input.allowSvg) allow.add("image/svg+xml");
  if (!allow.has(mime)) {
    throw new UploadSecurityError(`MIME type ${mime} is not allowed`);
  }

  const ext = path.extname(input.fileName).toLowerCase();
  const mimeExt: Record<string, string[]> = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "image/gif": [".gif"],
    "image/svg+xml": [".svg"],
    "application/pdf": [".pdf"],
    "video/mp4": [".mp4"],
  };
  const expected = mimeExt[mime];
  if (expected && ext && !expected.includes(ext)) {
    throw new UploadSecurityError("File extension does not match MIME type");
  }

  const safeName = input.fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.+/g, ".")
    .slice(0, 120);

  return { safeName, mimeType: mime };
}

/** Future virus-scan hook — returns clean until an AV provider is wired. */
export async function virusScanHook(_buffer: Buffer | ArrayBuffer): Promise<{
  clean: boolean;
  engine: string;
}> {
  void _buffer;
  return { clean: true, engine: "noop-future" };
}
