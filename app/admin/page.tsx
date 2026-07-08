import Link from "next/link";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { PageHero } from "@/shared/ui/PageHero";

const adminLinks = [
  { href: "/admin/orders", icon: "package" as const, label: "الطلبات والمدفوعات" },
  { href: "/admin/escrow", icon: "shield" as const, label: "الضمان المالي" },
  { href: "/admin/reports", icon: "wallet" as const, label: "تقارير الدفع" },
] as const;

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero
            description="مراجعة الطلبات، المدفوعات عبر Stripe، الضمان، والاسترداد."
            eyebrow="الإدارة"
            title="لوحة الإدارة"
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {adminLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card
                  className="flex items-center gap-3 p-5 transition hover:border-primary/30"
                  variant="flat"
                >
                  <Icon name={link.icon} size={20} />
                  <span className="font-semibold text-ink">{link.label}</span>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
