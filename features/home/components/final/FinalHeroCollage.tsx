import Link from "next/link";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";
import { getFinalHeroCollage } from "@/services/content/homepage-final.content";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

function FloatingCard({
  aspectClass,
  badge,
  city,
  className = "",
  href,
  imageUrl,
  price,
  showEscrow,
  title,
}: {
  aspectClass: string;
  badge: string;
  city: string;
  className?: string;
  href: string;
  imageUrl: string;
  price: number;
  showEscrow?: boolean;
  title: string;
}) {
  return (
    <Link
      className={`group block overflow-hidden rounded-[1.25rem] border border-white/90 bg-white shadow-[0_20px_50px_rgb(15_20_25/14%)] transition duration-300 hover:shadow-[0_24px_60px_rgb(15_20_25/18%)] ${className}`}
      href={href}
    >
      <div className={`relative overflow-hidden ${aspectClass}`}>
        <AppImage
          alt={title}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          fill
          sizes="(max-width: 1024px) 100vw, 28vw"
          src={imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[0.65rem] font-bold text-ink shadow-sm">
            {badge}
          </span>
          {showEscrow ? (
            <Badge className="shadow-sm" variant="escrow">
              ضمان مالي
            </Badge>
          ) : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <p className="text-sm font-bold text-white">{title}</p>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <p className="text-base font-bold text-white">
              {priceFormatter.format(price)}{" "}
              <span className="text-[0.65rem] font-semibold text-white/75">د.إ</span>
            </p>
            <span className="inline-flex items-center gap-1 text-[0.65rem] font-medium text-white/85">
              <Icon name="map" size={11} />
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
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <FloatingCard
        aspectClass="aspect-[16/10]"
        badge={villa.badge}
        city={villa.city}
        className="relative z-10"
        href={villa.href}
        imageUrl={villa.imageUrl}
        price={villa.price}
        title={villa.title}
      />

      <div className="relative z-20 -mt-5 grid grid-cols-5 gap-3 sm:-mt-6 sm:gap-4">
        <FloatingCard
          aspectClass="aspect-[3/4] min-h-[11rem]"
          badge={car.badge}
          city={car.city}
          className="col-span-2"
          href={car.href}
          imageUrl={car.imageUrl}
          price={car.price}
          title={car.title}
        />
        <FloatingCard
          aspectClass="aspect-[4/3] min-h-[9rem]"
          badge={phone.badge}
          city={phone.city}
          className="col-span-3 self-end"
          href={phone.href}
          imageUrl={phone.imageUrl}
          price={phone.price}
          showEscrow={phone.showEscrow}
          title={phone.title}
        />
      </div>
    </div>
  );
}
