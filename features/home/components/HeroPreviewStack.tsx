import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";
import { HeroDeviceMockup } from "./HeroDeviceMockup";
import { HeroEscrowBadge } from "./HeroEscrowBadge";

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
    <article className="premium-float-card overflow-hidden rounded-[var(--radius-2xl)] border border-white/25 bg-white/96 shadow-[var(--shadow-xl)] backdrop-blur-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        <AppImage
          alt={listing.title}
          className="object-cover"
          fill
          priority={priority}
          sizes="(max-width: 768px) 60vw, 250px"
          src={listing.imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
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
    <div className={`absolute w-[min(100%,14.5rem)] sm:w-[min(100%,15.5rem)] ${className}`}>
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
      className="relative mx-auto h-[22rem] w-full max-w-md sm:h-[26rem] lg:mx-0 lg:h-[32rem] lg:max-w-none"
      role="group"
    >
      <div className="hero-preview-glow absolute inset-0 rounded-[var(--radius-2xl)]" />

      <div className="absolute end-0 top-0 z-40 hidden lg:block">
        <HeroDeviceMockup />
      </div>

      {tertiary ? (
        <FloatingCard
          animationClass="hero-float-delayed"
          className="end-2 top-6 z-10 sm:end-6 sm:top-8 lg:end-16"
          listing={tertiary}
        />
      ) : null}

      {secondary ? (
        <FloatingCard
          animationClass="hero-float-slow"
          badge="ضمان مالي"
          className="start-0 top-16 z-20 sm:start-2 sm:top-20 lg:start-0"
          listing={secondary}
        />
      ) : null}

      <FloatingCard
        animationClass="hero-float"
        className="bottom-8 start-1/2 z-30 w-[min(100%,16rem)] -translate-x-1/2 sm:bottom-10 sm:w-[min(100%,17rem)] lg:bottom-12 lg:start-[38%] lg:-translate-x-1/2"
        listing={primary}
        priority
      />

      <HeroEscrowBadge />

      <div className="absolute bottom-0 start-1/2 z-40 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-white/92 px-4 py-2.5 text-xs font-bold text-ink shadow-[var(--shadow-lg)] backdrop-blur-md">
        <span className="relative flex size-2" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        +24,000 إعلان نشط الآن
      </div>

      <div className="absolute end-0 top-1/2 z-30 -translate-y-1/2 lg:hidden">
        <HeroDeviceMockup />
      </div>
    </div>
  );
}
