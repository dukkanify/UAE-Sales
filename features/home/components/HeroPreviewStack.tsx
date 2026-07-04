import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";

type HeroPreviewStackProps = {
  listings: Listing[];
};

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

type PreviewCardProps = {
  badge?: string;
  listing: Listing;
  priority?: boolean;
};

function PreviewCard({ badge, listing, priority = false }: PreviewCardProps) {
  return (
    <article className="overflow-hidden rounded-[var(--radius-2xl)] border border-white/20 bg-white/95 shadow-[var(--shadow-xl)] backdrop-blur-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        <AppImage
          alt={listing.title}
          className="object-cover"
          fill
          priority={priority}
          sizes="(max-width: 768px) 60vw, 250px"
          src={listing.imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        {badge ? (
          <div className="absolute start-3 top-3">
            <Badge variant="verified">{badge}</Badge>
          </div>
        ) : null}
        {listing.isFeatured ? (
          <div className="absolute end-3 top-3">
            <Badge variant="featured">مميز</Badge>
          </div>
        ) : null}
      </div>

      <div className="p-3.5">
        <h3 className="line-clamp-2 text-sm font-bold leading-6 text-ink">
          {listing.title}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-base font-black text-accent">
            {priceFormatter.format(listing.price)}{" "}
            <span className="text-[0.65rem] font-semibold text-muted">د.إ</span>
          </p>
          <span className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-muted">
            <Icon name="map" size={11} />
            {listing.city}
          </span>
        </div>
      </div>
    </article>
  );
}

type FloatingCardProps = {
  animationClass: string;
  badge?: string;
  className: string;
  listing: Listing;
  priority?: boolean;
};

function FloatingCard({
  animationClass,
  badge,
  className,
  listing,
  priority,
}: FloatingCardProps) {
  return (
    <div className={`absolute w-[min(100%,15.5rem)] ${className}`}>
      <div className={`${animationClass} transition-transform duration-300 hover:scale-[1.02]`}>
        <PreviewCard badge={badge} listing={listing} priority={priority} />
      </div>
    </div>
  );
}

export function HeroPreviewStack({ listings }: HeroPreviewStackProps) {
  const [primary, secondary, tertiary] = listings;

  if (!primary) {
    return null;
  }

  return (
    <div
      aria-label="معاينة إعلانات المنصة"
      className="relative mx-auto h-[19rem] w-full max-w-sm sm:h-[22rem] sm:max-w-md lg:mx-0 lg:h-[30rem] lg:max-w-none"
      role="group"
    >
      <div className="hero-preview-glow absolute inset-0 rounded-[var(--radius-2xl)]" />

      {tertiary ? (
        <FloatingCard
          animationClass="hero-float-delayed"
          className="end-0 top-2 z-10 sm:end-2 sm:top-4"
          listing={tertiary}
        />
      ) : null}

      {secondary ? (
        <FloatingCard
          animationClass="hero-float-slow"
          badge="ضمان مالي"
          className="start-0 top-10 z-20 sm:start-4 sm:top-12"
          listing={secondary}
        />
      ) : null}

      <FloatingCard
        animationClass="hero-float"
        className="bottom-0 start-1/2 z-30 w-[min(100%,17rem)] -translate-x-1/2 sm:w-[min(100%,18rem)] lg:-translate-x-[42%]"
        listing={primary}
        priority
      />

      <div className="absolute bottom-2 start-1/2 z-40 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/25 bg-white/90 px-4 py-2 text-xs font-semibold text-ink shadow-[var(--shadow-md)] backdrop-blur-md">
        <span className="grid size-2 rounded-full bg-success" aria-hidden />
        +24,000 إعلان نشط الآن
      </div>
    </div>
  );
}
