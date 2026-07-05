import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

export function AdminUnauthorized() {
  return (
    <section className="app-container page-padding">
      <Card className="marketplace-panel mx-auto max-w-lg p-10 text-center" variant="flat">
        <span className="mx-auto grid size-16 place-items-center rounded-[var(--radius-2xl)] bg-accent-soft text-accent">
          <Icon name="shield" size={28} />
        </span>
        <h1 className="mt-6 text-2xl font-black text-ink">غير مصرح</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          هذه المنطقة مخصصة لمديري النظام فقط. إذا كنت تعتقد أن هذا خطأ، تواصل
          مع الدعم.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/" variant="secondary">
            العودة للرئيسية
          </Button>
          <Button href="/profile" variant="primary">
            لوحة المستخدم
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted">
          حساب المدير التجريبي:{" "}
          <Link className="text-primary underline" href="/login?next=/admin">
            admin@uaesales.demo
          </Link>
        </p>
      </Card>
    </section>
  );
}
