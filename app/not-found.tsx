import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function NotFoundPage() {
  return (
    <>
      <SiteHeader />
      <main className="app-container page-padding">
        <section className="mx-auto max-w-lg text-center">
          <p className="text-xs font-medium tracking-wide text-secondary uppercase">
            404
          </p>
          <h1 className="mt-2 text-3xl font-black text-ink">الصفحة غير موجودة</h1>
          <p className="mt-3 text-sm font-medium leading-7 text-muted">
            الرابط الذي طلبته غير متاح أو تم نقله. يمكنك العودة للرئيسية أو
            تصفح الإعلانات.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/">الرئيسية</Button>
            <Button href="/search" variant="secondary">
              تصفح الإعلانات
            </Button>
          </div>
          <Link className="sr-only" href="/">
            العودة للرئيسية
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
