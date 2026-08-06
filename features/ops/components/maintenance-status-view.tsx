import Link from "@/components/ui/app-link";
import { Clock3, Mail, Phone, RefreshCw, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

export type MaintenanceStatus = {
  enabled: boolean;
  statusMessage: string;
  estimatedReturnAt: string | null;
  contactEmail: string;
  contactPhone: string;
  platformName: string;
};

function formatEta(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function MaintenanceStatusView({ status }: { status: MaintenanceStatus }) {
  const eta = formatEta(status.estimatedReturnAt);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_#1E4A7A_0%,_#0B1F3A_45%,_#06101f_100%)] px-4 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/hero-aviation.svg')] bg-cover bg-center opacity-[0.08]" />
      <div className="relative z-10 mx-auto w-full max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
          <Wrench className="h-7 w-7 text-sky-300" aria-hidden />
        </div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300/90">
          {status.platformName}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          We&apos;ll be right back
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/75">{status.statusMessage}</p>

        {eta ? (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-sky-100 ring-1 ring-white/15">
            <Clock3 className="h-4 w-4" aria-hidden />
            Estimated return: <time dateTime={status.estimatedReturnAt!}>{eta}</time>
          </p>
        ) : null}

        <div className="mt-8 space-y-2 text-sm text-white/70">
          {status.contactEmail ? (
            <p className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" aria-hidden />
              <a
                className="underline-offset-2 hover:underline"
                href={`mailto:${status.contactEmail}`}
              >
                {status.contactEmail}
              </a>
            </p>
          ) : null}
          {status.contactPhone ? (
            <p className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" aria-hidden />
              <a className="underline-offset-2 hover:underline" href={`tel:${status.contactPhone}`}>
                {status.contactPhone}
              </a>
            </p>
          ) : null}
        </div>

        <Button asChild variant="secondary" className="mt-10 gap-2">
          <Link href={routes.home}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh home
          </Link>
        </Button>
      </div>
    </div>
  );
}
