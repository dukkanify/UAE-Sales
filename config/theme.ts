/**
 * Design theme tokens — official ATPL PASS brand guidelines.
 * Aero Blue #2E7DAA · Altitude Orange #DD9B30 · Academic Grey #7C7B80
 */

export const theme = {
  colors: {
    primary: {
      DEFAULT: "#2E7DAA",
      foreground: "#FFFFFF",
      50: "#EAF3F8",
      100: "#D0E5F0",
      200: "#A8CEE3",
      300: "#74B0D0",
      400: "#4A94BC",
      500: "#2E7DAA",
      600: "#25648A",
      700: "#1E4F6D",
      800: "#163A50",
      900: "#0B1A24",
    },
    accent: {
      DEFAULT: "#DD9B30",
      foreground: "#0B1A24",
      50: "#FBF5EA",
      100: "#F5E6C8",
      200: "#ECCF92",
      300: "#E5B85C",
      400: "#DD9B30",
      500: "#C48422",
      600: "#A36A1A",
    },
    academic: {
      DEFAULT: "#7C7B80",
      foreground: "#FFFFFF",
    },
    success: {
      DEFAULT: "#16A34A",
      foreground: "#FFFFFF",
    },
    warning: {
      DEFAULT: "#DD9B30",
      foreground: "#0B1A24",
    },
    error: {
      DEFAULT: "#DC2626",
      foreground: "#FFFFFF",
    },
    background: "#F5F7FA",
    card: "#FFFFFF",
    border: "#E2E6EC",
    muted: "#EEF1F5",
    foreground: "#0B1A24",
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
  },
  shadow: {
    soft: "0 1px 3px 0 rgb(11 26 36 / 0.05), 0 1px 2px -1px rgb(11 26 36 / 0.05)",
    medium: "0 8px 24px -8px rgb(46 125 170 / 0.18), 0 4px 10px -4px rgb(11 26 36 / 0.08)",
  },
} as const;

export type Theme = typeof theme;
