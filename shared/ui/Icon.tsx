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

const paths: Record<IconName, string> = {
  search:
    "M21 21l-5.2-5.2M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z",
  shield:
    "M12 3l7 3v6c0 4.4-2.9 8.5-7 10-4.1-1.5-7-5.6-7-10V6l7-3Z M9.5 12l1.8 1.8L15 10",
  heart:
    "M12 20s-6.5-4.2-8.8-8.2C1.4 8.4 3.6 5.5 6.7 5.5c1.7 0 3.2.8 4.3 2.1 1.1-1.3 2.6-2.1 4.3-2.1 3.1 0 5.3 2.9 3.5 6.3C18.5 15.8 12 20 12 20Z",
  "heart-filled":
    "M12 20s-6.5-4.2-8.8-8.2C1.4 8.4 3.6 5.5 6.7 5.5c1.7 0 3.2.8 4.3 2.1 1.1-1.3 2.6-2.1 4.3-2.1 3.1 0 5.3 2.9 3.5 6.3C18.5 15.8 12 20 12 20Z",
  user: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z",
  home:
    "M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z",
  grid: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
  wallet:
    "M4 7h14a2 2 0 0 1 2 2v1h-3a3 3 0 0 0 0 6h3v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm14 5h-2a1 1 0 0 0 0 2h2v-2Z",
  message:
    "M4 5h16v10a2 2 0 0 1-2 2H9l-5 4V5a2 2 0 0 1 2-2Z",
  plus: "M12 5v14M5 12h14",
  check: "M5 12.5 9.5 17 19 7",
  star:
    "M12 3.5 14.2 9l5.8.5-4.4 3.8 1.3 5.7L12 16.2 7.1 18.9 8.4 13.3 4 9.5l5.8-.5L12 3.5Z",
  map:
    "M9 19l-5-2V6l5 2 6-2 5 2v11l-5-2-6 2Zm0-13v11M15 6v11",
  clock: "M12 7v5l3 2 M12 21a9 9 0 1 1 9-9 9 9 0 0 1-9 9Z",
  filter:
    "M4 6h16M7 12h10M10 18h4",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  eye:
    "M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12Zm9.5-3a3 3 0 1 0 3 3 3 3 0 0 0-3-3Z",
  edit:
    "M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z M14 6l4 4",
  photo:
    "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm2 0h12v8l-3.5-3.5a1 1 0 0 0-1.4 0L8 16l-2-2V6Zm6 2.5A1.5 1.5 0 1 0 12 10a1.5 1.5 0 0 0 0-3Z",
  send: "M4 12 20 4 12 20v-6l8-2-8-2v-6Z",
  share:
    "M8.5 12.5 4 17v-3.5A2.5 2.5 0 0 1 6.5 11H8m7.5 1.5L20 17v-3.5A2.5 2.5 0 0 0 17.5 11H16M12 3v10M9 6l3-3 3 3",
  "share-2":
    "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  phone:
    "M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm4 14h.01",
  "chevron-left": "M15 6l-6 6 6 6",
  "chevron-right": "M9 6l6 6-6 6",
  "arrow-left": "M19 12H5M11 6l-6 6 6 6",
  package:
    "M12 3 20 7v10l-8 4-8-4V7l8-4Zm0 8 8-4M12 11 4 7M12 11v10",
  bell:
    "M15 17H9l-1 2h8l-1-2Zm-3 3a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2ZM18 14a6 6 0 1 0-12 0v4h12v-4Z",
  chart:
    "M5 19V9M10 19V5M15 19v-7M20 19V11",
  car:
    "M5 17h14M6 17v2M18 17v2M4 12h16l-1.5-5a2 2 0 0 0-2-1.5H7.5a2 2 0 0 0-2 1.5L4 12Zm3-3h10",
  laptop:
    "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8H4V7Zm-1 10h18",
  sofa:
    "M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M4 12h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4Z",
  briefcase:
    "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 9h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Z",
  watch:
    "M9 3h6l1 4H8l1-4Zm-1 14h8l1 4H8l1-4ZM12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4Z",
  paw:
    "M8.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM6 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM12 20c2.8 0 5-2 5-4.5S14.8 11 12 11s-5 1.5-5 4.5S9.2 20 12 20Z",
  wrench:
    "M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-2.8-2.8 2.1-2.1Z",
  baby:
    "M12 3a3 3 0 1 0 3 3 3 3 0 0 0-3-3Zm-5 9a5 5 0 0 0 10 0v1H7v-1Z",
  book:
    "M5 4h9a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Zm11 2h3v14h-3",
  sport:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-16a7 7 0 0 1 0 14",
  food:
    "M4 3v8a4 4 0 0 0 8 0V3M12 11v10M18 8V3M18 8a3 3 0 1 1-6 0",
};

const MENU_LINES = ["M4 7h16", "M4 12h16", "M4 17h16"] as const;
const CLOSE_LINES = ["M6 6l12 12", "M18 6 6 18"] as const;

export function Icon({ className = "", filled = false, name, size = 20 }: IconProps) {
  const isFilledHeart = name === "heart-filled" || (name === "heart" && filled);
  const strokeWidth = name === "menu" || name === "close" ? 2.25 : 1.75;
  const linePaths = name === "menu" ? MENU_LINES : name === "close" ? CLOSE_LINES : null;

  return (
    <svg
      aria-hidden
      className={className}
      fill={isFilledHeart ? "currentColor" : "none"}
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
    >
      {linePaths ? (
        linePaths.map((d) => <path key={d} d={d} />)
      ) : (
        <path d={paths[name === "heart-filled" ? "heart-filled" : name]} />
      )}
    </svg>
  );
}
