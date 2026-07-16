import type { ReactNode } from "react";

type IconName =
  | "search"
  | "shield"
  | "heart"
  | "heart-filled"
  | "user"
  | "home"
  | "grid"
  | "wallet"
  | "message"
  | "plus"
  | "check"
  | "star"
  | "map"
  | "clock"
  | "filter"
  | "menu"
  | "close"
  | "eye"
  | "edit"
  | "photo"
  | "send"
  | "share"
  | "share-2"
  | "phone"
  | "phone-call"
  | "whatsapp"
  | "mail"
  | "chevron-left"
  | "chevron-right"
  | "arrow-left"
  | "package"
  | "bell"
  | "chart"
  | "car"
  | "laptop"
  | "sofa"
  | "briefcase"
  | "watch"
  | "paw"
  | "wrench"
  | "baby"
  | "book"
  | "sport"
  | "food";

export type { IconName };

type IconProps = {
  className?: string;
  filled?: boolean;
  name: IconName;
  size?: number;
};

/** Single-path stroke icons (currentColor). */
const paths: Partial<Record<IconName, string>> = {
  search: "M21 21l-5.2-5.2M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z",
  shield:
    "M12 3l7 3v6c0 4.4-2.9 8.5-7 10-4.1-1.5-7-5.6-7-10V6l7-3Z M9.5 12l1.8 1.8L15 10",
  heart:
    "M12 20s-6.5-4.2-8.8-8.2C1.4 8.4 3.6 5.5 6.7 5.5c1.7 0 3.2.8 4.3 2.1 1.1-1.3 2.6-2.1 4.3-2.1 3.1 0 5.3 2.9 3.5 6.3C18.5 15.8 12 20 12 20Z",
  "heart-filled":
    "M12 20s-6.5-4.2-8.8-8.2C1.4 8.4 3.6 5.5 6.7 5.5c1.7 0 3.2.8 4.3 2.1 1.1-1.3 2.6-2.1 4.3-2.1 3.1 0 5.3 2.9 3.5 6.3C18.5 15.8 12 20 12 20Z",
  user: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z",
  home: "M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z",
  grid: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
  wallet:
    "M4 7h14a2 2 0 0 1 2 2v1h-3a3 3 0 0 0 0 6h3v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm14 5h-2a1 1 0 0 0 0 2h2v-2Z",
  /** Round chat bubble — universal messaging/chat cue */
  message:
    "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z",
  plus: "M12 5v14M5 12h14",
  check: "M5 12.5 9.5 17 19 7",
  star: "M12 3.5 14.2 9l5.8.5-4.4 3.8 1.3 5.7L12 16.2 7.1 18.9 8.4 13.3 4 9.5l5.8-.5L12 3.5Z",
  map: "M9 19l-5-2V6l5 2 6-2 5 2v11l-5-2-6 2Zm0-13v11M15 6v11",
  clock: "M12 7v5l3 2 M12 21a9 9 0 1 1 9-9 9 9 0 0 1-9 9Z",
  filter: "M4 6h16M7 12h10M10 18h4",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  eye: "M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12Zm9.5-3a3 3 0 1 0 3 3 3 3 0 0 0-3-3Z",
  edit: "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z M14 6l4 4",
  photo:
    "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm2 0h12v8l-3.5-3.5a1 1 0 0 0-1.4 0L8 16l-2-2V6Zm6 2.5A1.5 1.5 0 1 0 12 10a1.5 1.5 0 0 0 0-3Z",
  /** Paper plane — send message */
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4Z",
  /** Export/share arrow (iOS-style) */
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  "share-2": "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  /** Smartphone — device / app category */
  phone: "M7 3.5h10A1.5 1.5 0 0 1 18.5 5v14a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5ZM12 17.25h.01",
  /** Classic handset — call / هاتف */
  "phone-call":
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z",
  /** Envelope — email */
  mail: "M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 2 8 5 8-5",
  "chevron-left": "M15 6l-6 6 6 6",
  "chevron-right": "M9 6l6 6-6 6",
  "arrow-left": "M19 12H5M11 6l-6 6 6 6",
  package: "M12 3 20 7v10l-8 4-8-4V7l8-4Zm0 8 8-4M12 11 4 7M12 11v10",
  /** Classic notification bell — stroke body; clapper rendered separately */
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",
  chart: "M5 19V9M10 19V5M15 19v-7M20 19V11",
  car: "M5 16H3v-3l1.8-5.2A2 2 0 0 1 6.7 7h10.6a2 2 0 0 1 1.9 1.3L21 13.5V16h-2M5 16h14M7.5 9.5 9 7h6l1.5 2.5M7 16a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm7 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z",
  laptop: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8H4V6ZM3 16h18M2 18h20",
  sofa: "M3 12V9a2 2 0 0 1 2-2h1V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1h1a2 2 0 0 1 2 2v3M3 12h18v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3ZM7 14h10",
  briefcase:
    "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 9h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Zm4 0V7h8v2M12 12v3",
  watch:
    "M9 2.5h6V6H9V2.5Zm0 15H9v3.5h6V17.5H9ZM12 7a4.5 4.5 0 1 0 4.5 4.5A4.5 4.5 0 0 0 12 7Zm0 2a2.5 2.5 0 1 1-2.5 2.5A2.5 2.5 0 0 1 12 9Z",
  paw: "M8.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM6 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM12 20c2.8 0 5-2 5-4.5S14.8 11 12 11s-5 1.5-5 4.5S9.2 20 12 20Z",
  wrench:
    "M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-2.8-2.8 2.1-2.1Z",
  baby: "M12 3a3 3 0 1 0 3 3 3 3 0 0 0-3-3Zm-5 9a5 5 0 0 0 10 0v1H7v-1Z",
  book: "M5 4h9a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Zm11 2h3v14h-3",
  sport:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14.5L14.5 11H9.5L12 6.5Zm-5.8 3.5h5.6L12 15l-2.8-5Zm0 7 2.8-5 2.8 5H6.2Zm11.6 0h-5.6l2.8-5 2.8 5Z",
  food: "M4 3v8a4 4 0 0 0 8 0V3M12 11v10M18 8V3M18 8a3 3 0 1 1-6 0",
};

const MENU_LINES = ["M4 7h16", "M4 12h16", "M4 17h16"] as const;
const CLOSE_LINES = ["M6 6l12 12", "M18 6 6 18"] as const;

/** Contact icons that benefit from slightly heavier strokes at small sizes */
const CONTACT_ICONS = new Set<IconName>([
  "bell",
  "mail",
  "message",
  "phone-call",
  "send",
  "share",
  "share-2",
  "whatsapp",
]);

const BELL_CLAPPER = "M10.3 21a1.94 1.94 0 0 0 3.4 0";

const CATEGORY_ICONS = new Set<IconName>([
  "baby",
  "book",
  "briefcase",
  "car",
  "food",
  "home",
  "laptop",
  "paw",
  "phone",
  "sofa",
  "sport",
  "watch",
  "wrench",
]);

/** Official-style WhatsApp mark (filled, scales cleanly). */
const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

function ShareNodes() {
  return (
    <>
      <circle cx="18" cy="5" r="2.4" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="19" r="2.4" />
      <path d="M8.2 10.7 15.8 6.8M8.2 13.3l7.6 3.9" />
    </>
  );
}

export function Icon({ className = "", filled = false, name, size = 20 }: IconProps) {
  const resolvedName = name === "heart-filled" ? "heart-filled" : name;
  const isFilledHeart = resolvedName === "heart-filled" || (name === "heart" && filled);
  const isWhatsApp = name === "whatsapp";
  const isFilledIcon = isFilledHeart || isWhatsApp;

  const strokeWidth =
    name === "menu" || name === "close"
      ? 2.25
      : CONTACT_ICONS.has(name)
        ? 1.9
        : CATEGORY_ICONS.has(name)
          ? 2
          : 1.75;

  const linePaths = name === "menu" ? MENU_LINES : name === "close" ? CLOSE_LINES : null;

  let body: ReactNode;

  if (isWhatsApp) {
    body = <path d={WHATSAPP_PATH} fill="currentColor" stroke="none" />;
  } else if (name === "bell") {
    body = (
      <>
        <path d={paths.bell} />
        <path d={BELL_CLAPPER} />
      </>
    );
  } else if (name === "share" || name === "share-2") {
    body = <ShareNodes />;
  } else if (linePaths) {
    body = linePaths.map((d) => <path key={d} d={d} />);
  } else {
    const d = paths[isFilledHeart ? "heart-filled" : resolvedName];
    body = d ? <path d={d} /> : null;
  }

  return (
    <svg
      aria-hidden
      className={className}
      fill={isFilledIcon ? "currentColor" : "none"}
      height={size}
      stroke={isWhatsApp ? "none" : "currentColor"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={isWhatsApp ? undefined : strokeWidth}
      viewBox="0 0 24 24"
      width={size}
    >
      {body}
    </svg>
  );
}
