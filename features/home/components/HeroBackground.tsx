import Image from "next/image";

const HERO_BACKGROUND =
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2400&q=85";

export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Image
        alt=""
        className="object-cover object-center"
        fill
        priority
        sizes="100vw"
        src={HERO_BACKGROUND}
      />

      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgb(15_20_25/92)_0%,rgb(15_20_25/78)_38%,rgb(15_20_25/52)_62%,rgb(15_20_25/28)_100%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgb(201_169_98/22),transparent_55%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgb(196_30_58/12),transparent_45%)]" />

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--color-background)] to-transparent" />
    </div>
  );
}
