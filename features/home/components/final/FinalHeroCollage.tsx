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
  priority = false,
  showEscrow,
  showVerified,
  title,
}: {
  aspectClass: string;
  badge: string;
  city: string;
  className?: string;
  href: string;
  imageUrl: string;
  price: number;
  priority?: boolean;
  showEscrow?: boolean;
  showVerified?: boolean;
  title: string;
}) {
  return (
    <Link
      className={`group block overflow-hidden rounded-[1.25rem] border border-white bg-white shadow-[0_20px_50px_rgb(15_20_25/14%)] ring-1 ring-[#B8955F]/10 transition duration-300 hover:shadow-[0_28px_64px_rgb(15_20_25/18%)] hover:ring-[#B8955F]/25 ${className}`}
      href={href}
    >
      <div className={`relative overflow-hidden bg-[#e8e4de] ${aspectClass}`}>
        <AppImage
          alt={title}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 28vw"
          src={imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/96 px-2.5 py-1 text-[0.65rem] font-bold text-ink shadow-sm">
            {badge}
          </span>
          {showVerified ? (
            <Badge className="shadow-sm" variant="verified">
              موثق
            </Badge>
          ) : null}
          {showEscrow ? (
            <Badge className="shadow-sm" variant="escrow">
              ضمان مالي
            </Badge>
          ) : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <p className="line-clamp-2 text-sm font-bold leading-5 text-white">{title}</p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="text-base font-bold text-white">
              {priceFormatter.format(price)}{" "}
              <span className="text-[0.65rem] font-semibold text-white/80">د.إ</span>
            </p>
            <span className="inline-flex max-w-[48%] items-center gap-1 text-end text-[0.65rem] font-semibold leading-4 text-white/90">
              <Icon className="shrink-0" name="map" size={11} />
              <span className="line-clamp-2">{city}</span>
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
        priority
        showEscrow={villa.showEscrow}
        showVerified={villa.showVerified}
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
          showEscrow={car.showEscrow}
          showVerified={car.showVerified}
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
          showVerified={phone.showVerified}
          title={phone.title}
        />
      </div>
    </div>
  );
}
