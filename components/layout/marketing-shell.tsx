import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface MarketingShellProps {
  children: React.ReactNode;
}

function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export { MarketingShell };
