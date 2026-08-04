/**
 * Design theme tokens — aviation professional palette.
 * CSS variables in styles/globals.css are the source of truth for Tailwind.
 */

export const theme = {
  colors: {
    primary: {
      DEFAULT: "#0B1F3A",
      foreground: "#FFFFFF",
      50: "#E8EEF5",
      100: "#C5D4E6",
      200: "#9BB4D0",
      300: "#6F94BA",
      400: "#4A77A8",
      500: "#1E4A7A",
      600: "#163A62",
      700: "#0F2B4A",
      800: "#0B1F3A",
      900: "#071426",
    },
    accent: {
      DEFAULT: "#38BDF8",
      foreground: "#0B1F3A",
      50: "#F0F9FF",
      100: "#E0F2FE",
      200: "#BAE6FD",
      300: "#7DD3FC",
      400: "#38BDF8",
      500: "#0EA5E9",
      600: "#0284C7",
    },
    success: {
      DEFAULT: "#16A34A",
      foreground: "#FFFFFF",
    },
    warning: {
      DEFAULT: "#EA580C",
      foreground: "#FFFFFF",
    },
    error: {
      DEFAULT: "#DC2626",
      foreground: "#FFFFFF",
    },
    background: "#F3F4F6",
    card: "#FFFFFF",
    border: "#E5E7EB",
    muted: "#F9FAFB",
    foreground: "#0B1F3A",
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
  shadow: {
    soft: "0 1px 3px 0 rgb(11 31 58 / 0.06), 0 1px 2px -1px rgb(11 31 58 / 0.06)",
    medium: "0 4px 12px -2px rgb(11 31 58 / 0.08), 0 2px 6px -2px rgb(11 31 58 / 0.05)",
  },
} as const;

export type Theme = typeof theme;
