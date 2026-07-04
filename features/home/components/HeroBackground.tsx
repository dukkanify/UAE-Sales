import Image from "next/image";

const HERO_BACKGROUND =
  "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=2400&q=85";

export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Image
        alt=""
        className="object-cover object-[center_35%] scale-105"
        fill
        priority
        sizes="100vw"
        src={HERO_BACKGROUND}
      />

      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgb(15_20_25/94)_0%,rgb(15_20_25/82)_32%,rgb(15_20_25/45)_58%,rgb(15_20_25/18)_100%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_15%,rgb(201_169_98/35),transparent_50%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_85%,rgb(196_30_58/10),transparent_40%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(250_249_247)_0%,transparent_28%)]" />

      <div className="hero-cinematic-grain absolute inset-0 opacity-[0.18]" />
    </div>
  );
}
