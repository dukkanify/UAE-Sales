type BrandMarkProps = {
  className?: string;
  size?: number;
  variant?: "default" | "dark" | "gold";
};

/**
 * Sooqna icon mark — geometric S monogram with subtle marketplace arc.
 * Recognizable from 24px. Used in header, favicon, app icon, loading.
 */
export function BrandMark({
  className = "",
  size = 40,
  variant = "default",
}: BrandMarkProps) {
  const bg = variant === "gold" ? "#C9A962" : variant === "dark" ? "#0B1628" : "#0B1628";
  const sStroke = variant === "gold" ? "#0B1628" : "#FAF9F7";
  const accent = "#C9A962";

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
      <rect fill={bg} height="48" rx="11" width="48" />
      <path
        d="M30 15.5c0-3.6-2.9-6.5-6.5-6.5S17 11.9 17 15.5c0 2.4 1.3 4.5 3.2 5.6-3.5 1.1-5.7 4.2-5.7 7.9 0 4.6 3.7 8.3 8.3 8.3s8.3-3.7 8.3-8.3"
        stroke={sStroke}
        strokeLinecap="round"
        strokeWidth="2.75"
      />
      <path
        d="M18 21.5c2.8-2.2 6.2-2.2 9 0"
        opacity="0.85"
        stroke={accent}
        strokeLinecap="round"
        strokeWidth="2.25"
      />
      <path
        d="M13.5 13.5h21"
        opacity="0.55"
        stroke={accent}
        strokeLinecap="round"
        strokeWidth="1.75"
      />
      <circle cx="15.5" cy="36.5" fill={accent} opacity="0.45" r="1.75" />
      <circle cx="32.5" cy="36.5" fill={accent} opacity="0.45" r="1.75" />
    </svg>
  );
}
