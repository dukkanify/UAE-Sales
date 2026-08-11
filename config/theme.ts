/**
 * Design theme tokens — AviatorPass Option A (Horizon Blue & Sun Gold).
 * Official hexes from brand guidelines:
 *   Horizon Blue / Aero Blue #2E7DAA
 *   Sun Gold / Altitude Orange #DD9B30
 *   Academic Grey #7C7B80
 * Supporting surfaces are derived tints that sit with the lockup (no clash).
 */

export const theme = {
  colors: {
    /** Horizon Blue / Aero Blue — primary brand */
    primary: {
      DEFAULT: "#2E7DAA",
      foreground: "#FFFFFF",
      50: "#EAF4F9",
      100: "#D2E7F2",
      200: "#A8CFE4",
      300: "#74B2D1",
      400: "#4A95BD",
      500: "#2E7DAA",
      600: "#25648A",
      700: "#1E4F6D",
      800: "#163A50",
      900: "#0B1A24",
    },
    /** Sun Gold / Altitude Orange — PASS / accent */
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
    /** Supporting palette — Option A companions (not replacements) */
    support: {
      /** Cool off-white page wash */
      cloud: "#F7FAFC",
      /** Soft blue surface from Horizon Blue */
      skyMist: "#E8F3F8",
      /** Deeper horizon for hero / chrome */
      navyInk: "#0F2A3D",
      /** Warm sand from Sun Gold — soft accent panels */
      sandGlow: "#F8F1E4",
      /** Soft gold highlight wash */
      sunSoft: "#F3E0B8",
      /** Cool mid grey for rules / dividers */
      mistGrey: "#D5DCE3",
    },
    success: {
      DEFAULT: "#2F8F5B",
      foreground: "#FFFFFF",
    },
    warning: {
      DEFAULT: "#DD9B30",
      foreground: "#0B1A24",
    },
    error: {
      DEFAULT: "#C23B3B",
      foreground: "#FFFFFF",
    },
    background: "#F7FAFC",
    card: "#FFFFFF",
    border: "#D5DCE3",
    muted: "#E8F3F8",
    foreground: "#0B1A24",
  },
  /** Marketing aliases matching Option A naming */
  aliases: {
    horizonBlue: "#2E7DAA",
    aeroBlue: "#2E7DAA",
    sunGold: "#DD9B30",
    altitudeOrange: "#DD9B30",
    academicGrey: "#7C7B80",
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
