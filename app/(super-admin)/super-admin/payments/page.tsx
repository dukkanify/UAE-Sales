import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Payments" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Payments"
      description="Payment operations and reconciliations land in the finance module."
      role="super-admin"
      href="/super-admin/payments"
      icon="CreditCard"
      emptyTitle="Payments module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
