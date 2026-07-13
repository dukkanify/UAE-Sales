import type { Listing } from "@/types";
import { BRAND } from "@/shared/constants/brand";
import { Icon } from "@/shared/ui/Icon";
import { MobileAppDevicePreview } from "@/features/home/components/mobile/MobileAppDevicePreview";
import { resolveAppPreviewListings } from "@/features/home/components/mobile/mobile-app-preview.config";
import { MOBILE_APP_LINKS } from "@/features/home/components/mobile/mobile-home.config";
import {
  AppStoreBadgeLink,
  GooglePlayBadgeLink,
} from "@/features/home/components/mobile/MobileStoreBadges";
import { MarketSectionShell } from "./MarketSectionHeader";

const APP_FEATURES = [
  { icon: "bell" as const, label: "إشعارات فورية" },
  { icon: "message" as const, label: "محادثات مباشرة" },
  { icon: "grid" as const, label: "إدارة إعلاناتك" },
] as const;

type MarketAppDownloadProps = {
  previewListings?: Listing[];
};

export function MarketAppDownload({ previewListings = [] }: MarketAppDownloadProps) {
  return (
    <MarketSectionShell variant="sand">
      <div className="relative overflow-hidden rounded-3xl border border-secondary/20 bg-gradient-to-br from-primary via-[#162033] to-primary p-8 shadow-[0_20px_50px_rgb(15_23_42/20%)] md:p-10">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 end-0 size-40 rounded-full bg-secondary/15 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-8 start-0 size-32 rounded-full bg-blue-500/10 blur-3xl"
        />

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[minmax(14rem,18rem)_1fr] lg:gap-12">
          <div aria-hidden className="mx-auto w-full max-w-[15rem] lg:mx-0">
            <div className="relative mx-auto aspect-[9/19] w-full overflow-hidden rounded-[2rem] border-[6px] border-[#1a2332] bg-[#0b1220] shadow-[0_24px_60px_rgb(0_0_0/35%)]">
              <div className="absolute top-2 inset-x-0 z-10 mx-auto h-5 w-24 rounded-full bg-black/80" />
              <div className="absolute inset-[6px] overflow-hidden rounded-[1.4rem] bg-[#f4f6f8]">
                {previewListings.length > 0 ? (
                  <MobileAppDevicePreview listings={resolveAppPreviewListings(previewListings)} />
                ) : (
                  <div className="size-full bg-[#e8edf2]" />
                )}
              </div>
            </div>
          </div>

          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/12 px-3 py-1.5 text-xs font-bold text-secondary">
              <Icon name="phone" size={14} />
              حمّل التطبيق
            </span>

            <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">
              تسوّق أسرع مع تطبيق{" "}
              <span className="font-[family-name:var(--font-latin)] text-secondary">
                {BRAND.nameEn}
              </span>
            </h2>

            <p className="mt-3 max-w-xl text-base leading-7 text-white/78">
              كل مزايا سوقنا في جيبك — تصفّح، تواصل، وانشر إعلاناتك بسهولة.
            </p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {APP_FEATURES.map((feature) => (
                <li
                  key={feature.label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary/15 text-secondary">
                    <Icon name={feature.icon} size={16} />
                  </span>
                  {feature.label}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <AppStoreBadgeLink href={MOBILE_APP_LINKS.appStore} />
              <GooglePlayBadgeLink href={MOBILE_APP_LINKS.playStore} />
            </div>
          </div>
        </div>
      </div>
    </MarketSectionShell>
  );
}
