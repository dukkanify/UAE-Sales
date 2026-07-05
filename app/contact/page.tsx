import { LegalPage } from "@/shared/components/LegalPage";
import { Button } from "@/shared/ui/Button";

export default function ContactPage() {
  return (
    <LegalPage
      description="تواصل مع فريق UAE Sales."
      title="تواصل معنا"
    >
      <p>للدعم العام والاستفسارات التجارية:</p>
      <ul className="mt-4 space-y-2">
        <li>البريد: support@uaesales.demo</li>
        <li>الهاتف: 800-UAE-SALE (placeholder)</li>
        <li>ساعات العمل: 9 صباحاً – 9 مساءً (بتوقيت الإمارات)</li>
      </ul>
      <Button className="mt-6" href="/support" variant="secondary">
        مركز الدعم
      </Button>
    </LegalPage>
  );
}
