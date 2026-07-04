import Link from "next/link";

type ChipLinkProps = {
  active?: boolean;
  href: string;
  label: string;
};

export function ChipLink({ active = false, href, label }: ChipLinkProps) {
  return (
    <Link
      className={`inline-flex min-h-9 items-center rounded-[var(--radius-md)] border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-secondary bg-secondary-soft text-primary"
          : "border-border bg-surface text-muted hover:border-secondary/40 hover:text-ink"
      }`}
      href={href}
    >
      {label}
    </Link>
  );
}
