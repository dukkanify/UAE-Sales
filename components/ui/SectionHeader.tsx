import type { ReactNode } from "react";

type SectionHeaderProps = {
  action?: ReactNode;
  align?: "center" | "start";
  description?: string;
  eyebrow?: string;
  title: string;
};

export function SectionHeader({
  action,
  align = "start",
  description,
  eyebrow,
  title,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`mb-10 flex flex-col gap-5 md:mb-12 ${
        isCenter
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={isCenter ? "max-w-2xl" : "max-w-xl"}>
        {eyebrow ? (
          <p className="mb-3 inline-flex items-center gap-2 rounded-lg border border-secondary/20 bg-secondary-soft px-3 py-1.5 text-xs font-bold text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-3xl font-black tracking-tight text-ink md:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-base leading-8 text-muted md:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
