type StoreBadgeProps = {
  className?: string;
};

/** Recognizable App Store download badge (black). */
export function AppStoreBadgeSvg({ className = "" }: StoreBadgeProps) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 140 42"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="#000" height="42" rx="7" width="140" />
      <path
        d="M24.8 20.6c.02 2.1 1.8 2.8 1.82 2.81-.02.06-.28.96-.93 1.9-.56.81-1.14 1.62-2.05 1.64-.9.02-1.19-.54-2.24-.54-1.04 0-1.36.52-2.22.56-.9.04-1.58-.9-2.15-1.72-1.17-1.7-2.07-4.8-.85-6.9.6-1.06 1.68-1.72 2.86-1.74 1-.02 1.93.66 2.25.66.31 0 1.28-.82 2.16-.7.36.02 1.4.15 2.07 1.12-.05.03-1.25.73-1.23 2.19ZM22.4 7.2c.54-.66.91-1.58.81-2.5-.78.03-1.73.53-2.29 1.19-.5.59-.94 1.54-.82 2.44.86.07 1.75-.45 2.3-1.13Z"
        fill="#fff"
      />
      <text
        fill="#fff"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize="7.5"
        letterSpacing="0.02em"
        x="44"
        y="15"
      >
        Download on the
      </text>
      <text
        fill="#fff"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize="14.5"
        fontWeight="600"
        letterSpacing="-0.01em"
        x="44"
        y="31"
      >
        App Store
      </text>
    </svg>
  );
}

/** Recognizable Google Play download badge (black + multicolor icon). */
export function GooglePlayBadgeSvg({ className = "" }: StoreBadgeProps) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 155 46"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="#000" height="46" rx="7" width="155" />
      <path d="M9.5 7.8v30.4l18.2-15.2L9.5 7.8Z" fill="#32BBFF" />
      <path d="M29.2 23 11.7 38.2l24.8-14.4-7.3-5Z" fill="#F9AB00" />
      <path d="M11.7 7.6 29.2 23l7.3-4.2L36.6 8.2 11.7 7.6Z" fill="#3DDC84" />
      <path d="m36.6 37.8-7.3-4.2L29.2 23l7.3 4.2 4.9 2.8c.9.5.9 1.8 0 2.3l-4.8 2.7Z" fill="#EA4335" />
      <text
        fill="#fff"
        fontFamily="system-ui, Roboto, 'Segoe UI', sans-serif"
        fontSize="7"
        fontWeight="500"
        letterSpacing="0.08em"
        x="50"
        y="16"
      >
        GET IT ON
      </text>
      <text
        fill="#fff"
        fontFamily="system-ui, Roboto, 'Segoe UI', sans-serif"
        fontSize="15"
        fontWeight="500"
        letterSpacing="-0.01em"
        x="50"
        y="33"
      >
        Google Play
      </text>
    </svg>
  );
}
