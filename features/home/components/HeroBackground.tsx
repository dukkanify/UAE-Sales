import Image from "next/image";

const SKYLINE_WATERMARK =
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80";

export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--color-background)]" />

      <div className="absolute inset-y-0 end-0 w-full max-w-3xl opacity-[0.055] lg:w-1/2">
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
