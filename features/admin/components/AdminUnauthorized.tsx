"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

export function AdminUnauthorized() {
  return (
    <section className="app-container page-padding">
      <Card className="mx-auto max-w-lg p-8 text-center" variant="flat">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[rgb(201_164_92_/_14%)] text-[#a88642]">
          <Icon name="shield" size={24} />
        </span>
        <h1 className="mt-5 text-xl font-black text-ink">غير مصرح بالدخول</h1>
        <p className="mt-2 text-sm leading-7 text-muted">
          هذه اللوحة مخصصة لمديري Sooqna فقط. سجّل الدخول بحساب الأدمن للمتابعة.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button href="/login?next=/admin">تسجيل دخول الأدمن</Button>
          <Link className="text-sm font-semibold text-muted hover:text-ink" href="/">
            العودة للرئيسية
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted">
          تجريبي: <span className="font-semibold text-ink">admin@sooqna.demo</span> /{" "}
          <span className="font-semibold text-ink">Admin@123</span>
        </p>
      </Card>
    </section>
  );
}
