import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface MarketingShellProps {
  children: React.ReactNode;
}

/** Server shell composing client Header/Footer — keeps layout out of Zod client graph. */
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
