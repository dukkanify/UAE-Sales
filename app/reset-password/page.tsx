import { ResetPasswordContent } from "@/features/auth/components/ResetPasswordContent";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader />
      <main>
        <ResetPasswordContent token={params.token} />
      </main>
      <SiteFooter />
    </>
  );
}
