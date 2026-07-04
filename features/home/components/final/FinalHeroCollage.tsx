import Link from "next/link";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";
import { getFinalHeroCollage } from "@/services/content/homepage-final.content";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

function ListingCard({
  aspectClass,
  city,
  href,
  imageUrl,
  price,
  priority = false,
  title,
  trustBadge,
}: {
  aspectClass: string;
  city: string;
  href: string;
  imageUrl: string;
  price: number;
  priority?: boolean;
  title: string;
  trustBadge: "escrow" | "verified";
}) {
  return (
    <Link
      className="group block overflow-hidden rounded-2xl border border-white/90 bg-white shadow-[0_12px_40px_rgb(15_20_25/10%)] ring-1 ring-black/[0.04] transition duration-300 hover:shadow-[0_18px_48px_rgb(15_20_25/14%)]"
      href={href}
    >
      <div className={`relative overflow-hidden bg-[#e8e4de] ${aspectClass}`}>
        <AppImage
          alt={title}
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 28vw"
          src={imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/8 to-transparent" />
        <div className="absolute start-3 top-3">
          <Badge className="shadow-sm" variant={trustBadge === "escrow" ? "escrow" : "verified"}>
            {trustBadge === "escrow" ? "ضمان مالي" : "موثق"}
          </Badge>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
          <p className="line-clamp-2 text-sm font-bold leading-5 text-white">{title}</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-base font-bold text-white">
              {priceFormatter.format(price)}{" "}
              <span className="text-[0.65rem] font-semibold text-white/80">د.إ</span>
            </p>
            <span className="inline-flex shrink-0 items-center gap-1 text-[0.7rem] font-medium text-white/90">
              <Icon className="shrink-0" name="map" size={12} />
              {city}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export async function FinalHeroCollage() {
  const items = await getFinalHeroCollage();
  const villa = items.find((item) => item.id === "real-estate");
  const car = items.find((item) => item.id === "cars");
  const phone = items.find((item) => item.id === "mobiles");

  if (!villa || !car || !phone) {
    return null;
  }

  return (
    <div className="grid gap-3.5 sm:gap-4">
      <ListingCard
        aspectClass="aspect-[16/9] max-h-52 sm:max-h-none"
        city={villa.city}
        href={villa.href}
        imageUrl={villa.imageUrl}
        price={villa.price}
        priority
        title={villa.title}
        trustBadge={villa.trustBadge}
      />

      <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
        <ListingCard
          aspectClass="aspect-[4/5] max-h-56 sm:max-h-none"
          city={car.city}
          href={car.href}
          imageUrl={car.imageUrl}
          price={car.price}
          title={car.title}
          trustBadge={car.trustBadge}
        />
        <ListingCard
          aspectClass="aspect-[4/5] max-h-56 sm:max-h-none"
          city={phone.city}
          href={phone.href}
          imageUrl={phone.imageUrl}
          price={phone.price}
          title={phone.title}
          trustBadge={phone.trustBadge}
        />
      </div>
    </div>
  );
}
