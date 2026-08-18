import { redirect } from "next/navigation";

type NewDisputePageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function NewDisputePage({ searchParams }: NewDisputePageProps) {
  const { orderId } = await searchParams;
  const query = orderId?.trim()
    ? `?orderId=${encodeURIComponent(orderId.trim())}`
    : "";
  redirect(`/dashboard/disputes${query}`);
}
