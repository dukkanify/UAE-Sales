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
      className={`mb-8 flex flex-col gap-4 md:mb-10 ${
        isCenter
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={isCenter ? "max-w-2xl" : "max-w-xl"}>
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold tracking-wide text-secondary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-black tracking-tight text-ink md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-base font-medium leading-8 text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
