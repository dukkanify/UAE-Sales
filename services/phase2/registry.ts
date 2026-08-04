/**
 * Phase 2 capability registry — reads feature flags; does not enable unfinished UX.
 */

import { PHASE2_PILLARS } from "@/constants/phase2";
import { getPlatformSettings } from "@/services/settings/settings-service";
import type { Phase2CapabilityStatus } from "@/types/phase2";
import type { FeatureFlags } from "@/types/settings";

export function listPhase2Capabilities(): Phase2CapabilityStatus[] {
  const features = getPlatformSettings().features;
  return PHASE2_PILLARS.map((p) => {
    const enabled = Boolean(features[p.flag as keyof FeatureFlags]);
    return {
      id: p.id,
      title: p.title,
      flag: p.flag,
      enabled,
      train: p.train,
      // Foundations only — full product delivery is per-train execution
      implemented: false,
      docPath: p.docPath,
      summary: p.summary,
    };
  });
}

export function getPhase2Capability(id: string): Phase2CapabilityStatus | null {
  return listPhase2Capabilities().find((c) => c.id === id) ?? null;
}
