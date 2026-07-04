import { AppImage } from "@/shared/components/AppImage";
import { Icon } from "@/shared/ui/Icon";
import { getFinalTestimonials } from "@/services/content/homepage-final.content";
import { FinalSectionHeader } from "./FinalSectionHeader";

export async function FinalTestimonials() {
  const testimonials = await getFinalTestimonials();

  return (
    <section className="bg-surface-muted/50 py-16 md:py-20">
      <div className="app-container">
        <FinalSectionHeader
          description="قصص حقيقية من مستخدمين يبيعون ويشترون في الإمارات كل يوم."
          title="ماذا يقول مستخدمونا"
        />

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="flex flex-col rounded-[var(--radius-2xl)] border border-border bg-white p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center gap-4">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-surface-muted">
                  <AppImage
                    alt={item.name}
                    className="object-cover"
                    fill
                    sizes="56px"
                    src={item.avatarUrl}
                  />
                </div>
                <div>
                  <p className="font-bold text-ink">{item.name}</p>
                  <p className="text-xs font-medium text-muted">{item.city}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-0.5 text-secondary">
                {Array.from({ length: item.rating }).map((_, index) => (
                  <Icon key={index} name="star" size={14} />
                ))}
              </div>

              <p className="mt-4 flex-1 text-sm leading-7 text-ink md:text-base">
                &ldquo;{item.quote}&rdquo;
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
