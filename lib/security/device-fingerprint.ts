/**
 * Browser device fingerprint helpers (CR002).
 * Produces a stable-ish hash from common client signals — deterrent, not cryptographic DRM.
 */

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function describeDeviceFromUserAgent(userAgent: string | null | undefined): string {
  const ua = (userAgent || "").trim();
  if (!ua) return "Unknown device";

  let browser = "Browser";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";

  let os = "Unknown OS";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return `${browser} on ${os}`;
}

/** Collect a device fingerprint in the browser. Returns null on server. */
export async function collectDeviceFingerprint(): Promise<string | null> {
  if (typeof window === "undefined" || typeof navigator === "undefined") return null;

  const parts: string[] = [
    navigator.userAgent || "",
    navigator.language || "",
    String(navigator.hardwareConcurrency || 0),
    String((navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0),
    String(window.screen?.width || 0),
    String(window.screen?.height || 0),
    String(window.screen?.colorDepth || 0),
    String(new Date().getTimezoneOffset()),
    String(navigator.maxTouchPoints || 0),
    navigator.platform || "",
  ];

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 24;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#1e3a5f";
      ctx.fillRect(0, 0, 64, 24);
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("AviatorPass", 2, 4);
      parts.push(canvas.toDataURL());
    }
  } catch {
    // ignore canvas failures
  }

  const raw = parts.join("|");
  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const data = new TextEncoder().encode(raw);
      const digest = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 64);
    } catch {
      // fall through
    }
  }
  return `fp_${fnv1a(raw)}${fnv1a(raw.split("").reverse().join(""))}`;
}
