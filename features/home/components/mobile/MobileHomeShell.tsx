import type { ReactNode } from "react";
import { MobileBottomNav } from "./MobileBottomNav";

type MobileHomeShellProps = {
  children: ReactNode;
  /** When true, shell is not hidden at lg+ (device-targeted homepage). */
  fullWidth?: boolean;
};

export function MobileHomeShell({
  children,
  fullWidth = false,
}: MobileHomeShellProps) {
  return (
    <div
      className={`mobile-home-shell min-h-screen${fullWidth ? "" : " lg:hidden"}`}
    >
      <div className="mobile-home-page">{children}</div>
      <MobileBottomNav />
    </div>
  );
}
