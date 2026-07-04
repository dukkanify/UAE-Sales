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
  className?: string;
  listing: Listing;
  priority?: boolean;
};

function PreviewCard({
  badge,
  className = "",
  listing,
  priority = false,
}: PreviewCardProps) {
  return (
    <article
      className={`premium-float-card overflow-hidden rounded-[var(--radius-2xl)] border border-white/25 bg-white/96 shadow-[var(--shadow-xl)] backdrop-blur-md ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        <AppImage
          alt={listing.title}
          className="object-cover"
          fill
          priority={priority}
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 250px"
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
          <span className="inline-flex shrink-0 items-center gap-1 text-[0.7rem] font-medium text-muted">
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
    <div className={`absolute w-[min(100%,13.5rem)] sm:w-[min(100%,15rem)] lg:w-[min(100%,15.5rem)] ${className}`}>
      <div
        className={`${animationClass} transition-transform duration-300 motion-reduce:animate-none hover:scale-[1.02]`}
      >
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
      className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
      role="group"
    >
      {/* Mobile: single clean card — no overlap */}
      <div className="sm:hidden">
        <PreviewCard className="mx-auto max-w-[18rem]" listing={primary} priority />
        <p className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-white/85">
          <span className="size-2 rounded-full bg-success" aria-hidden />
          +24,000 إعلان نشط الآن
        </p>
      </div>

      {/* Tablet + desktop: layered preview */}
      <div className="relative hidden h-[24rem] sm:block md:h-[26rem] lg:h-[32rem]">
        <div className="hero-preview-glow absolute inset-0 rounded-[var(--radius-2xl)]" />

        <div className="absolute end-0 top-0 z-40 hidden lg:block">
          <HeroDeviceMockup />
        </div>

        {tertiary ? (
          <FloatingCard
            animationClass="hero-float-delayed"
            className="end-4 top-6 z-10 hidden md:block lg:end-16 lg:top-8"
            listing={tertiary}
          />
        ) : null}

        {secondary ? (
          <FloatingCard
            animationClass="hero-float-slow"
            badge="ضمان مالي"
            className="start-2 top-14 z-20 md:start-4 md:top-20 lg:start-0"
            listing={secondary}
          />
        ) : null}

        <FloatingCard
          animationClass="hero-float"
          className="bottom-10 start-1/2 z-30 -translate-x-1/2 sm:bottom-12 lg:bottom-12 lg:start-[38%]"
          listing={primary}
          priority
        />

        <HeroEscrowBadge />

        <div className="absolute bottom-0 start-1/2 z-40 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/30 bg-white/92 px-4 py-2.5 text-xs font-bold text-ink shadow-[var(--shadow-lg)] backdrop-blur-md">
          <span className="size-2 shrink-0 rounded-full bg-success motion-reduce:animate-none" aria-hidden />
          <span className="truncate">+24,000 إعلان نشط الآن</span>
        </div>

        <div className="absolute end-0 top-1/2 z-30 hidden -translate-y-1/2 md:block lg:hidden">
          <HeroDeviceMockup />
        </div>
      </div>
    </div>
  );
}
