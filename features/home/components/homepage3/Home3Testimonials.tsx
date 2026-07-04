import { AppImage } from "@/shared/components/AppImage";
import { Icon } from "@/shared/ui/Icon";
import { getHomepage3Testimonials } from "@/services/content/homepage3.content";
import { Home3SectionHeader } from "./Home3SectionHeader";

export async function Home3Testimonials() {
  const testimonials = await getHomepage3Testimonials();

  return (
    <section className="bg-white py-28">
      <div className="app-container">
        <Home3SectionHeader
          description="ثقة حقيقية من مستخدمين يبيعون ويشترون في الإمارات كل يوم."
          eyebrow="Testimonials"
          title="قصص تجعل السوق أكثر إنسانية"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-[2rem] border border-border bg-[#fffbf4] p-6 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center gap-4">
                <div className="relative size-16 overflow-hidden rounded-full bg-surface-muted">
                  <AppImage
                    alt={item.name}
                    className="object-cover"
                    fill
                    sizes="64px"
                    src={item.avatarUrl}
                  />
                </div>
                <div>
                  <p className="font-black text-ink">{item.name}</p>
                  <p className="mt-1 text-xs font-semibold text-muted">
                    {item.role} — {item.city}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-1 text-secondary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Icon key={index} name="star" size={14} />
                ))}
              </div>
              <p className="mt-5 text-lg font-medium leading-9 text-ink">
                &ldquo;{item.quote}&rdquo;
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
