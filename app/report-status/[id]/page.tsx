import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { Card } from "@/shared/ui/Card";
import { getListingReportReceipt } from "@/services/listings/listing-report-store";
import { LISTING_REPORT_REASON_LABELS } from "@/types/domain/listing-report";

type ReportStatusPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

function getToken(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReportStatusPage({
  params,
  searchParams,
}: ReportStatusPageProps) {
  const { id } = await params;
  const token = getToken((await searchParams).token) ?? "";
  const report = await getListingReportReceipt(id, token);

  if (!report) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <LocalizedTree>
      <main className="app-container page-padding py-10">
        <Card className="mx-auto max-w-lg p-6" variant="flat">
          <p className="text-xs font-bold tracking-wide text-secondary">ملخص البلاغ</p>
          <h1 className="mt-1 text-2xl font-black text-ink">تفاصيل بلاغك</h1>
          <p className="mt-2 text-sm text-muted">
            حتى بدون حساب، حفظنا بياناتك ليراجعها فريق الثقة.
          </p>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">رقم البلاغ</dt>
              <dd className="font-bold text-ink" dir="ltr">
                {report.id}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">الحالة</dt>
              <dd className="font-semibold text-ink">
                {report.status === "open" ? "قيد المراجعة" : "تمت المراجعة"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">الإعلان</dt>
              <dd className="font-semibold text-ink">{report.listingTitle}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">المُبلِغ</dt>
              <dd className="text-start font-semibold text-ink">
                {report.reporterName}
                {report.guest ? " (زائر)" : ""}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">البريد</dt>
              <dd className="font-semibold text-ink" dir="ltr">
                {report.reporterEmail}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">الهاتف</dt>
              <dd className="font-semibold text-ink" dir="ltr">
                {report.reporterPhone}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">السبب</dt>
              <dd className="font-semibold text-ink">
                {LISTING_REPORT_REASON_LABELS[report.reason]}
              </dd>
            </div>
            {report.details ? (
              <div className="grid gap-1">
                <dt className="text-muted">التفاصيل</dt>
                <dd className="font-medium text-ink">{report.details}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-5 text-sm text-muted">
            الإدارة ترى البلاغ من{" "}
            <Link className="font-bold text-primary" href="/admin/listing-reports">
              بلاغات الإعلانات
            </Link>
            .
          </p>
        </Card>
      </main>
      </LocalizedTree>
      <SiteFooter />
    </>
  );
}
