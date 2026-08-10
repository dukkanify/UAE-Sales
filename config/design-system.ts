/**
 * AviatorPass Design System — official brand guidelines tokens.
 * Aero Blue #2E7DAA · Altitude Orange #DD9B30 · Academic Grey #7C7B80
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
    label: "Display (Stimulatio Flat / Space Grotesk)",
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
  primary: { name: "Aero Blue", value: "#2E7DAA" },
  secondary: { name: "Academic Grey", value: "#7C7B80" },
  accent: { name: "Altitude Orange", value: "#DD9B30" },
  success: { name: "Green", value: "#16A34A" },
  warning: { name: "Altitude Orange", value: "#DD9B30" },
  danger: { name: "Red", value: "#DC2626" },
  background: { name: "Sky Mist", value: "#F3F6F9" },
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
