import type { ReactNode } from "react";
import { MobileBottomNav } from "./MobileBottomNav";

type MobileHomeShellProps = {
  children: ReactNode;
};

export function MobileHomeShell({ children }: MobileHomeShellProps) {
  return (
    <div className="mobile-home-shell min-h-screen lg:hidden">
      {children}
      <MobileBottomNav />
    </div>
  );
}
