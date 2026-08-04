import { ModulePlaceholder } from "@/components/dashboard";

export const metadata = { title: "Wallet" };

export default function Page() {
  return (
    <ModulePlaceholder
      title="Wallet"
      description="Earnings and payout readiness for instructors."
      role="instructor"
      href="/instructor/wallet"
      icon="Wallet"
      emptyTitle="Wallet module ready"
      emptyDescription="Architecture is in place. Business logic arrives in a later task."
    />
  );
}
