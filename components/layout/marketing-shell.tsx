import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface MarketingShellProps {
  children: React.ReactNode;
}

/**
 * Server-only marketing chrome.
 * Do NOT import this from Client Components (see PublicLayout) — that causes
 * webpack "Cannot read properties of undefined (reading 'call')".
 */
function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="platform-surface flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export { MarketingShell };
