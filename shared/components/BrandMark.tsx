type BrandMarkProps = {
  className?: string;
  size?: number;
  variant?: "default" | "dark" | "gold";
};

const VARIANTS = {
  default: {
    accent: "#C9A962",
    bgFrom: "#0B1628",
    bgTo: "#1A2D4A",
    innerStroke: "rgba(255,255,255,0.12)",
    stroke: "#FAF9F7",
    swooshOpacity: 0.92,
  },
  dark: {
    accent: "#D4B87A",
    bgFrom: "#0B1628",
    bgTo: "#152238",
    innerStroke: "rgba(255,255,255,0.1)",
    stroke: "#FAF9F7",
    swooshOpacity: 0.88,
  },
  gold: {
    accent: "#0B1628",
    bgFrom: "#E2C882",
    bgTo: "#A88642",
    innerStroke: "rgba(255,255,255,0.28)",
    stroke: "#0B1628",
    swooshOpacity: 0.32,
  },
} as const;

/**
 * Sooqna icon mark — geometric S monogram with marketplace swoosh.
 * Optimized for 24px+ with gradient depth and crisp curves.
 */
export function BrandMark({
  className = "",
  size = 40,
  variant = "default",
}: BrandMarkProps) {
  const palette = VARIANTS[variant];
  const gradientId = `sooqna-mark-bg-${variant}`;

  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 48 48"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          x1="6"
          x2="42"
          y1="4"
          y2="44"
        >
          <stop offset="0%" stopColor={palette.bgFrom} />
          <stop offset="100%" stopColor={palette.bgTo} />
        </linearGradient>
      </defs>

      <rect fill={`url(#${gradientId})`} height="48" rx="13" width="48" />
      <rect
        fill="none"
        height="47"
        rx="12.5"
        stroke={palette.innerStroke}
        strokeWidth="1"
        width="47"
        x="0.5"
        y="0.5"
      />

      <path
        d="M29.75 14.25c0-3.9-3.15-7.05-7.55-7.05-4.15 0-7.45 2.95-7.45 6.65 0 2.25 1.2 4.2 3.15 5.35-3.25 1.05-5.35 3.95-5.35 7.35 0 4.35 3.55 7.85 8.05 7.85s8.05-3.5 8.05-7.85c0-2.95-1.65-5.45-4.1-6.75"
        fill="none"
        stroke={palette.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />

      <path
        d="M17.25 22.75c3.05-2.35 6.7-2.35 9.75 0"
        opacity={palette.swooshOpacity}
        stroke={variant === "gold" ? palette.stroke : palette.accent}
        strokeLinecap="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}
