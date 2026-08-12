/**
 * AviatorPass Design System — official brand guidelines.
 * Aviator Blue #143048 · Aviator Gold #CCA04C · Academic Grey #7C7B80
 */

export const breakpoints = {
  mobile: 0,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  wide: 1536,
} as const;

export const typographyScale = {
  display: {
    className: "font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl",
    label: "Display (Stimulatio Flat / Exo 2)",
  },
  h1: {
    className: "font-display text-3xl font-semibold tracking-tight sm:text-4xl",
    label: "Heading 1",
  },
  h2: {
    className: "font-display text-2xl font-semibold tracking-tight",
    label: "Heading 2",
  },
  h3: {
    className: "font-display text-xl font-semibold",
    label: "Heading 3",
  },
  h4: {
    className: "font-display text-lg font-semibold",
    label: "Heading 4",
  },
  body: {
    className: "font-sans text-base leading-relaxed",
    label: "Body (IBM Plex Sans)",
  },
  caption: {
    className: "font-sans text-xs text-muted-foreground",
    label: "Caption",
  },
  label: {
    className: "font-sans text-sm font-medium",
    label: "Label",
  },
  button: {
    className: "font-sans text-sm font-medium",
    label: "Button",
  },
} as const;

export const colorRoles = {
  primary: { name: "Aviator Blue", value: "#143048" },
  secondary: { name: "Academic Grey", value: "#7C7B80" },
  accent: { name: "Aviator Gold", value: "#CCA04C", aka: "Gold mid #CCA04C" },
  success: { name: "Runway Green", value: "#2F8F5B" },
  warning: { name: "Aviator Gold", value: "#CCA04C" },
  danger: { name: "Signal Red", value: "#C23B3B" },
  background: { name: "Cloud", value: "#F4F6F8" },
  muted: { name: "Sky Mist", value: "#E6ECF1" },
  sand: { name: "Sand Glow", value: "#F8F1E4" },
  ink: { name: "Navy Ink", value: "#0D2235" },
  card: { name: "White", value: "#FFFFFF" },
} as const;

export const radiusScale = {
  sm: "8px",
  md: "10px",
  lg: "12px",
  xl: "16px",
} as const;

export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const motion = {
  page: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
  fade: { duration: 0.2, ease: "easeOut" as const },
  spring: { type: "spring" as const, stiffness: 380, damping: 30 },
};

export const emptyStatePresets = [
  "courses",
  "students",
  "notifications",
  "calendar",
  "messages",
  "community",
  "reports",
  "generic",
] as const;

export type EmptyStatePreset = (typeof emptyStatePresets)[number];
