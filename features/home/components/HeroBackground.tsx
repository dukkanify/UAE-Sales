import Image from "next/image";

const HERO_BACKGROUND =
  "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1920&q=75";

export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Image
        alt=""
        className="object-cover object-[center_35%]"
        fill
        priority
        sizes="100vw"
        src={HERO_BACKGROUND}
      />

      {/* RTL: content sits on the right — keep that side darker for legibility */}
      <div className="absolute inset-0 bg-[linear-gradient(to_left,rgb(15_20_25/94)_0%,rgb(15_20_25/78)_32%,rgb(15_20_25/42)_58%,rgb(15_20_25/20)_100%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_18%,rgb(201_169_98/28),transparent_52%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(250_249_247)_0%,transparent_24%)]" />

      <div className="hero-cinematic-grain absolute inset-0 opacity-[0.12] sm:opacity-[0.15]" />
    </div>
  );
}
