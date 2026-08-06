import Link from "@/components/ui/app-link";

import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { safeHref } from "@/lib/links/safe-href";

interface SystemPageProps {
  code?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

function SystemPage({
  code,
  title,
  description,
  actionHref,
  actionLabel = "Back to home",
}: SystemPageProps) {
  const href = safeHref(actionHref, routes.home);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_55%)] opacity-[0.08]" />
      <div className="relative z-10 mx-auto max-w-lg text-center">
        {code ? (
          <p className="font-display text-7xl font-bold tracking-tight text-primary/15 sm:text-8xl">
            {code}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base text-muted-foreground">{description}</p>
        <Button asChild className="mt-8">
          <Link href={href}>{actionLabel}</Link>
        </Button>
      </div>
    </div>
  );
}

export { SystemPage };
