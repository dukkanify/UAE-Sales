import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { Icon } from "@/shared/ui/Icon";
import { getAuthTrustPoints } from "@/services/content";
import "./auth.css";

type AuthShellProps = {
  children: ReactNode;
  description: string;
  footerAction: {
    href: string;
    label: string;
    prompt: string;
  };
  title: string;
};

export async function AuthShell({
  children,
  description,
  footerAction,
  title,
}: AuthShellProps) {
  const trustPoints = await getAuthTrustPoints();
  const titleParts = title.split("سوقنا");
  const hasBrandInTitle = title.includes("سوقنا");

  return (
    <section className="auth-shell app-container page-padding">
      <aside className="auth-shell__showcase">
        <div className="auth-shell__showcase-inner">
          <BrandLogo showTagline={false} size="md" theme="dark" />

          <span className="auth-shell__eyebrow">
            <span className="inline-block h-3 w-4 overflow-hidden rounded-sm uae-flag-strip" />
            منصة إماراتية موثوقة
          </span>

          <h1 className="auth-shell__title">
            {hasBrandInTitle ? (
              <>
                {titleParts[0]}
                <span className="auth-shell__title-accent">سوقنا</span>
                {titleParts[1]}
              </>
            ) : (
              title
            )}
          </h1>

          <p className="auth-shell__description">{description}</p>

          <ul className="auth-shell__points">
            {trustPoints.map((point) => (
              <li key={point} className="auth-shell__point">
                <span className="auth-shell__point-mark" aria-hidden>
                  <Icon name="check" size={12} />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="auth-shell__panel">
        <div className="auth-shell__card">
          <div aria-hidden className="auth-shell__card-accent" />
          {children}
          <div className="auth-shell__footer">
            {footerAction.prompt}{" "}
            <Link href={footerAction.href}>{footerAction.label}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
