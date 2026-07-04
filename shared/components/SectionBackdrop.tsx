type SectionBackdropVariant = "gold" | "mesh" | "night" | "warm";

type SectionBackdropProps = {
  className?: string;
  variant?: SectionBackdropVariant;
};

const variantClasses: Record<SectionBackdropVariant, string> = {
  gold: "section-backdrop-gold",
  mesh: "section-backdrop-mesh",
  night: "section-backdrop-night",
  warm: "section-backdrop-warm",
};

export function SectionBackdrop({
  className = "",
  variant = "warm",
}: SectionBackdropProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${variantClasses[variant]} ${className}`}
    >
      <div className="section-backdrop-orb section-backdrop-orb-a" />
      <div className="section-backdrop-orb section-backdrop-orb-b" />
    </div>
  );
}
