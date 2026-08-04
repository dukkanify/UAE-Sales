import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Instructor wallets" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Instructor wallets"
      description="Wallet balances, payouts, and ledger views arrive with payments."
      role="super-admin"
      href="/super-admin/wallets"
      icon="Wallet"
      emptyTitle="Instructor wallets module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
