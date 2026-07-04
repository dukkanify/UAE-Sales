import { AppImage } from "@/shared/components/AppImage";
import { getFinalHeroCollage } from "@/services/content/homepage-final.content";

export async function FinalHeroCollage() {
  const items = await getFinalHeroCollage();
  const [villa, car, phone] = items;

  if (!villa || !car || !phone) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:gap-4">
      <article className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-2xl)] bg-surface-muted shadow-[var(--shadow-card)]">
        <AppImage
          alt={villa.label}
          className="object-cover"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          src={villa.imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="text-xs font-semibold text-white/75">{villa.category}</p>
          <p className="mt-0.5 text-lg font-bold text-white">{villa.label}</p>
        </div>
      </article>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <article className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-2xl)] bg-surface-muted shadow-[var(--shadow-card)]">
          <AppImage
            alt={car.label}
            className="object-cover"
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            src={car.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
            <p className="text-[0.65rem] font-semibold text-white/75 sm:text-xs">
              {car.category}
            </p>
            <p className="mt-0.5 text-sm font-bold text-white sm:text-base">
              {car.label}
            </p>
          </div>
        </article>

        <article className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-2xl)] bg-surface-muted shadow-[var(--shadow-card)]">
          <AppImage
            alt={phone.label}
            className="object-cover"
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            src={phone.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
            <p className="text-[0.65rem] font-semibold text-white/75 sm:text-xs">
              {phone.category}
            </p>
            <p className="mt-0.5 text-sm font-bold text-white sm:text-base">
              {phone.label}
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
