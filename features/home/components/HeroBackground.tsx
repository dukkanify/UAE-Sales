import Image from "next/image";

const SKYLINE_WATERMARK =
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80";

export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffdf8_0%,var(--color-background)_72%,#fff_100%)]" />

      <div className="absolute -top-24 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-secondary/15 blur-3xl" />
      <div className="absolute bottom-10 end-10 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />

      <div className="absolute inset-y-0 start-0 w-full max-w-3xl opacity-[0.07] lg:w-1/2">
        <Image
          alt=""
          className="object-cover object-center"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          src={SKYLINE_WATERMARK}
        />
      </div>

      <div className="absolute inset-x-0 top-0 h-px bg-border/80" />
    </div>
  );
}
