import Link from "next/link";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";
import { getFinalHeroCollage } from "@/services/content/homepage-final.content";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

function ListingMeta({
  city,
  price,
  title,
}: {
  city: string;
  price: number;
  title: string;
}) {
  return (
    <>
      <p className="text-sm font-bold text-white sm:text-base">{title}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-lg font-bold text-white sm:text-xl">
          {priceFormatter.format(price)}{" "}
          <span className="text-xs font-semibold text-white/75">د.إ</span>
        </p>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-white/80">
          <Icon name="map" size={12} />
          {city}
        </span>
      </div>
    </>
  );
}

export async function FinalHeroCollage() {
  const items = await getFinalHeroCollage();
  const car = items.find((item) => item.id === "cars");
  const villa = items.find((item) => item.id === "real-estate");
  const phone = items.find((item) => item.id === "mobiles");

  if (!car || !villa || !phone) {
    return null;
  }

  return (
    <div className="relative">
      <Link
        className="group relative block aspect-[16/10] overflow-hidden rounded-[var(--radius-2xl)] border border-white/80 bg-surface-muted shadow-[0_12px_48px_rgb(15_20_25/12%)] transition duration-300 hover:shadow-[0_16px_56px_rgb(15_20_25/16%)]"
        href={car.href}
      >
        <AppImage
          alt={car.title}
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          src={car.imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute start-4 top-4">
          <span className="rounded-full bg-white/92 px-2.5 py-1 text-[0.65rem] font-bold text-ink shadow-[var(--shadow-xs)]">
            {car.category}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <ListingMeta city={car.city} price={car.price} title={car.title} />
        </div>
      </Link>

      <div className="relative z-10 -mt-3 grid grid-cols-2 gap-3 px-1 sm:-mt-4 sm:gap-4 sm:px-2">
        <Link
          className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-2xl)] border border-white/80 bg-surface-muted shadow-[0_8px_32px_rgb(15_20_25/10%)] transition duration-300 hover:shadow-[0_12px_40px_rgb(15_20_25/14%)]"
          href={villa.href}
        >
          <AppImage
            alt={villa.title}
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            src={villa.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
            <p className="text-[0.65rem] font-semibold text-white/75 sm:text-xs">
              {villa.category}
            </p>
            <ListingMeta city={villa.city} price={villa.price} title={villa.title} />
          </div>
        </Link>

        <Link
          className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-2xl)] border border-white/80 bg-surface-muted shadow-[0_8px_32px_rgb(15_20_25/10%)] transition duration-300 hover:shadow-[0_12px_40px_rgb(15_20_25/14%)]"
          href={phone.href}
        >
          <AppImage
            alt={phone.title}
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            src={phone.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          {phone.showEscrow ? (
            <div className="absolute start-3 top-3">
              <Badge className="shadow-[var(--shadow-xs)]" variant="escrow">
                ضمان مالي
              </Badge>
            </div>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
            <p className="text-[0.65rem] font-semibold text-white/75 sm:text-xs">
              {phone.category}
            </p>
            <ListingMeta city={phone.city} price={phone.price} title={phone.title} />
          </div>
        </Link>
      </div>
    </div>
  );
}
