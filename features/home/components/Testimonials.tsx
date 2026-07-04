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
    <section className="section-padding">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="آراء من مستخدمين في الإمارات."
          eyebrow="آراء المستخدمين"
          title="يثقون بنا"
        />

        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <Card key={item.name} className="p-5">
              <div className="flex gap-0.5 text-secondary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Icon key={index} name="star" size={12} />
                ))}
              </div>
              <p className="mt-4 text-sm font-medium leading-7 text-muted">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span className="grid size-9 place-items-center rounded-[var(--radius-xl)] bg-primary text-xs font-semibold text-white">
                  {item.name.slice(0, 2)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{item.name}</p>
                  <p className="text-xs font-medium text-muted">
                    {item.role} — {item.city}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
