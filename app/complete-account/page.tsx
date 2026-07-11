import { CompleteAccountContent } from "@/features/auth/components/CompleteAccountContent";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

type CompleteAccountPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function CompleteAccountPage({
  searchParams,
}: CompleteAccountPageProps) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader />
      <main>
        <CompleteAccountContent token={params.token} />
      </main>
      <SiteFooter />
    </>
  );
}
