/**
 * Design theme tokens — AviatorPass brand guidelines.
 * Official hexes:
 *   Aviator Blue #143048
 *   Aviator Gold #9E712E → #CCA04C → #F6C36C (solid mid #CCA04C)
 *   Academic Grey #7C7B80
 * Supporting surfaces are derived tints that sit with the lockup.
 */

export const theme = {
  colors: {
    /** Aviator Blue — primary brand */
    primary: {
      DEFAULT: "#143048",
      foreground: "#FFFFFF",
      50: "#F0F3F6",
      100: "#D9E1E8",
      200: "#B3C3D1",
      300: "#7A97AD",
      400: "#466A86",
      500: "#143048",
      600: "#11293D",
      700: "#0D2235",
      800: "#0A1A28",
      900: "#06101A",
    },
    /** Aviator Gold — PASS / accent (gradient mid) */
    accent: {
      DEFAULT: "#CCA04C",
      foreground: "#0B1A24",
      50: "#FBF6EC",
      100: "#F5E9CF",
      200: "#EBD19A",
      300: "#E0B86E",
      400: "#CCA04C",
      500: "#B5893A",
      600: "#9E712E",
    },
    academic: {
      DEFAULT: "#7C7B80",
      foreground: "#FFFFFF",
    },
    /** Supporting palette — companions (not replacements) */
    support: {
      cloud: "#F4F6F8",
      skyMist: "#E6ECF1",
      navyInk: "#0D2235",
      sandGlow: "#F8F1E4",
      sunSoft: "#F3E4C0",
      mistGrey: "#D5D8DD",
      goldDark: "#9E712E",
      goldMid: "#CCA04C",
      goldLight: "#F6C36C",
    },
    success: {
      DEFAULT: "#2F8F5B",
      foreground: "#FFFFFF",
    },
    warning: {
      DEFAULT: "#CCA04C",
      foreground: "#0B1A24",
    },
    error: {
      DEFAULT: "#C23B3B",
      foreground: "#FFFFFF",
    },
    background: "#F4F6F8",
    card: "#FFFFFF",
    border: "#D5D8DD",
    muted: "#E6ECF1",
    foreground: "#0B1A24",
  },
  /** Marketing aliases matching brand guideline names */
  aliases: {
    aviatorBlue: "#143048",
    aviatorGold: "#CCA04C",
    aviatorGoldDark: "#9E712E",
    aviatorGoldLight: "#F6C36C",
    academicGrey: "#7C7B80",
    /** Legacy aliases kept for call sites during migration */
    horizonBlue: "#143048",
    aeroBlue: "#143048",
    sunGold: "#CCA04C",
    altitudeOrange: "#CCA04C",
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
  },
  shadow: {
    soft: "0 1px 3px 0 rgb(11 26 36 / 0.05), 0 1px 2px -1px rgb(11 26 36 / 0.05)",
    medium: "0 8px 24px -8px rgb(20 48 72 / 0.22), 0 4px 10px -4px rgb(11 26 36 / 0.08)",
  },
} as const;

export type Theme = typeof theme;
