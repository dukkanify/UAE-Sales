import type { ReactNode } from "react";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { Card } from "@/shared/ui/Card";
import { PageHero } from "@/shared/ui/PageHero";

type LegalPageProps = {
  children: ReactNode;
  description: string;
  title: string;
};

export function LegalPage({ children, description, title }: LegalPageProps) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero description={description} eyebrow="الثقة والأمان" title={title} />
          <Card className="marketplace-panel mt-6 p-6 text-sm leading-8 text-muted" variant="flat">
            {children}
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
