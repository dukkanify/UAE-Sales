import Link from "next/link";

type StoreBadgeLinkProps = {
  className?: string;
  href: string;
};

function AppleIcon() {
  return (
    <svg aria-hidden className="mobile-home-app__store-btn-graphic" viewBox="0 0 24 24">
      <path
        d="M16.34 12.2c.02 2.14 1.88 2.86 1.9 2.87-.02.06-.29.98-.96 1.94-.58.83-1.18 1.65-2.12 1.67-.93.02-1.23-.55-2.3-.55-1.07 0-1.4.53-2.28.57-.92.04-1.62-.92-2.21-1.75-1.2-1.74-2.12-4.92-.87-7.07.62-1.08 1.73-1.76 2.94-1.78 1.02-.02 1.98.68 2.3.68.32 0 1.32-.84 2.22-.72.38.02 1.45.15 2.14 1.14-.05.03-1.28.75-1.26 2.24ZM13.9 4.4c.56-.68.94-1.62.84-2.56-.81.03-1.79.54-2.37 1.22-.52.6-.97 1.57-.85 2.5.9.07 1.82-.46 2.38-1.16Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GooglePlayIcon() {
  return (
    <svg
      aria-hidden
      className="mobile-home-app__store-btn-graphic"
      viewBox="0 0 28.99 31.99"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.54 15.28.12 29.34a3.66 3.66 0 0 0 5.33 2.16l15.1-8.6Z"
        fill="#EA4335"
      />
      <path
        d="m27.11 12.89-6.53-3.74-7.35 6.45 7.38 7.28 6.48-3.7a3.54 3.54 0 0 0 1.5-4.79 3.62 3.62 0 0 0-1.5-1.5z"
        fill="#FBBC04"
      />
      <path
        d="M.12 2.66a3.57 3.57 0 0 0-.12.92v24.84a3.57 3.57 0 0 0 .12.92L14 15.64Z"
        fill="#4285F4"
      />
      <path
        d="m13.64 16 6.94-6.85L5.5.51A3.73 3.73 0 0 0 3.63 0 3.64 3.64 0 0 0 .12 2.65Z"
        fill="#34A853"
      />
    </svg>
  );
}

export function AppStoreBadgeLink({ className = "", href }: StoreBadgeLinkProps) {
  return (
    <Link
      aria-label="حمّل من App Store"
      className={`mobile-home-app__store-btn ${className}`.trim()}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="mobile-home-app__store-btn-icon">
        <AppleIcon />
      </span>
      <span className="mobile-home-app__store-btn-copy">
        <span className="mobile-home-app__store-btn-eyebrow">Download on the</span>
        <span className="mobile-home-app__store-btn-title">App Store</span>
      </span>
    </Link>
  );
}

export function GooglePlayBadgeLink({ className = "", href }: StoreBadgeLinkProps) {
  return (
    <Link
      aria-label="متوفر على Google Play"
      className={`mobile-home-app__store-btn ${className}`.trim()}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="mobile-home-app__store-btn-icon mobile-home-app__store-btn-icon--play">
        <GooglePlayIcon />
      </span>
      <span className="mobile-home-app__store-btn-copy">
        <span className="mobile-home-app__store-btn-eyebrow">GET IT ON</span>
        <span className="mobile-home-app__store-btn-title">Google Play</span>
      </span>
    </Link>
  );
}
