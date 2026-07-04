import Link from "next/link";

export function AppDownload() {
  return (
    <section className="section-padding">
      <div className="app-container">
        <div className="overflow-hidden rounded-3xl border border-border bg-[linear-gradient(135deg,var(--color-surface-muted),var(--color-surface))] p-8 md:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold text-secondary">التطبيق قريباً</p>
              <h2 className="mt-3 text-3xl font-black text-ink md:text-4xl">
                UAE Sales في جيبك
              </h2>
              <p className="mt-4 max-w-md leading-8 text-muted">
                تطبيق iOS وAndroid قيد التطوير — أضف إعلاناتك، تابع معاملاتك،
                وتواصل مع المشترين من أي مكان.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-5 text-sm font-bold text-muted">
                  App Store — قريباً
                </span>
                <span className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-5 text-sm font-bold text-muted">
                  Google Play — قريباً
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="h-64 w-40 rounded-[2rem] border-4 border-primary bg-primary p-3 shadow-[var(--shadow-lg)]">
                  <div className="grid h-full place-items-center rounded-[1.4rem] bg-surface-muted">
                    <span className="text-center">
                      <span className="block text-2xl font-black text-primary">
                        UAE
                      </span>
                      <span className="mt-1 block text-xs font-bold text-muted">
                        Sales
                      </span>
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-8 h-48 w-36 rounded-[1.8rem] border-4 border-border bg-surface p-2 opacity-60 shadow-[var(--shadow-md)]" />
              </div>
            </div>
          </div>

          <div className="mt-8 text-center lg:text-right">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:-translate-y-px"
              href="/register"
            >
              سجّل الآن للحصول على إشعار الإطلاق
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
