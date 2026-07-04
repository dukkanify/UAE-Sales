import type { HomeTestimonial } from "@/types";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { getHomeTestimonials } from "@/services/content";

type TestimonialsProps = {
  testimonials?: HomeTestimonial[];
};

export async function Testimonials(props: TestimonialsProps = {}) {
  const items = props.testimonials ?? (await getHomeTestimonials());

  return (
    <section className="section-padding bg-surface">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="آراء من مستخدمين في الإمارات."
          eyebrow="آراء المستخدمين"
          title="يثقون بنا"
        />

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {items.map((item) => (
            <Card key={item.name} className="p-6" variant="flat">
              <div className="flex gap-0.5 text-secondary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Icon key={index} name="star" size={12} />
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-semibold text-ink">{item.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {item.role} — {item.city}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
