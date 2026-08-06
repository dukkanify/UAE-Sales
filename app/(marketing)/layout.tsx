import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * Marketing segment layout — imports client Header/Footer directly.
 * Avoids a shared MarketingShell module that Client Components also pulled in
 * (illegal Server→Client reverse import → webpack reading 'call').
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="platform-surface flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
