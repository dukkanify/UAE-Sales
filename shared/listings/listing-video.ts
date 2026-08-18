export type ListingVideoEmbed =
  | { kind: "iframe"; src: string }
  | { kind: "file"; src: string };

function youtubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.replace("/", "") || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] || null;
      }
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

function vimeoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("vimeo.com")) return null;
    const match = parsed.pathname.match(/\/(?:video\/)?(\d+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function getListingVideoEmbed(url: string): ListingVideoEmbed | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith("data:video/") ||
    trimmed.startsWith("blob:") ||
    /\.(mp4|webm|ogg|mov)(\?|$)/i.test(trimmed)
  ) {
    return { kind: "file", src: trimmed };
  }

  const yt = youtubeId(trimmed);
  if (yt) {
    return { kind: "iframe", src: `https://www.youtube.com/embed/${yt}` };
  }

  const vimeo = vimeoId(trimmed);
  if (vimeo) {
    return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo}` };
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return { kind: "file", src: trimmed };
  }

  return null;
}
