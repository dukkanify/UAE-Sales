import type { HomeTestimonial } from "@/types";
import { SectionBackdrop } from "@/shared/components/SectionBackdrop";
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
    <section className="relative overflow-hidden">
      <SectionBackdrop variant="mesh" />

      <div className="app-container relative section-padding">
        <SectionHeader
          align="center"
          description="آراء حقيقية من مستخدمين في جميع إمارات الدولة."
          eyebrow="آراء المستخدمين"
          title="يثقون بنا"
        />

        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.name}
              className="testimonial-card-premium relative overflow-hidden p-6"
              variant="glass"
            >
              <Icon
                className="absolute end-4 top-4 text-secondary/25"
                name="message"
                size={40}
              />
              <div className="flex gap-0.5 text-secondary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Icon key={index} name="star" size={13} />
                ))}
              </div>
              <p className="mt-5 text-sm font-medium leading-8 text-muted">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border/80 pt-5">
                <span className="grid size-11 place-items-center rounded-[var(--radius-xl)] bg-gradient-to-br from-primary to-night-soft text-xs font-bold text-white">
                  {item.name.slice(0, 2)}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{item.name}</p>
                  <p className="text-xs font-semibold text-muted">
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
