"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckoutPinMap } from "@/features/checkout/components/CheckoutPinMap";
import {
  CHECKOUT_LIVE_LOCATION_COPY,
  type CheckoutLiveLocationValue,
} from "@/features/checkout/lib/checkout-live-location";
import { useLocale } from "@/shared/i18n/useLocale";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import type { ReverseGeocodeResult } from "@/services/geo/uae-geocode";

type CheckoutLiveLocationProps = {
  confirmed: CheckoutLiveLocationValue | null;
  onConfirm: (value: CheckoutLiveLocationValue) => void;
};

type Mode = "idle" | "locating" | "editing";

function toValue(result: ReverseGeocodeResult): CheckoutLiveLocationValue {
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    formattedAddress: result.formattedAddress,
    emirate: result.emirate,
    city: result.city,
    area: result.area,
  };
}

export function CheckoutLiveLocation({ confirmed, onConfirm }: CheckoutLiveLocationProps) {
  const locale = useLocale();
  const copy = CHECKOUT_LIVE_LOCATION_COPY[locale];
  const [mode, setMode] = useState<Mode>("idle");
  const [draft, setDraft] = useState<CheckoutLiveLocationValue | null>(confirmed);
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");
  const reverseTimerRef = useRef<number>(0);
  const requestIdRef = useRef(0);
  const lookupRef = useRef<(lat: number, lng: number, silent?: boolean) => Promise<void>>(
    async () => undefined,
  );

  useEffect(() => {
    return () => {
      window.clearTimeout(reverseTimerRef.current);
    };
  }, []);

  const lookup = useCallback(
    async (lat: number, lng: number, silent = false) => {
      const requestId = ++requestIdRef.current;
      try {
        const response = await fetch("/api/geo/reverse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng, language: locale }),
        });
        if (requestId !== requestIdRef.current) return;
        if (response.status === 429) {
          window.setTimeout(() => {
            void lookupRef.current(lat, lng, silent);
          }, 1100);
          return;
        }
        if (!response.ok) {
          throw new Error("GEOCODE_FAILED");
        }
        const data = (await response.json()) as { location?: ReverseGeocodeResult };
        if (!data.location) throw new Error("GEOCODE_FAILED");
        setDraft(toValue(data.location));
        setWarning(data.location.inUae ? "" : copy.outsideUae);
        if (data.location.source === "nearest-emirate" && data.location.inUae) {
          setWarning(copy.geocodeFailed);
        }
        setMessage("");
        if (!silent) setMode("editing");
      } catch {
        if (requestId !== requestIdRef.current) return;
        setDraft({
          latitude: lat,
          longitude: lng,
          formattedAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          emirate: "",
          city: "",
          area: "",
        });
        setWarning(copy.geocodeFailed);
        if (!silent) setMode("editing");
      }
    },
    [copy.geocodeFailed, copy.outsideUae, locale],
  );

  useEffect(() => {
    lookupRef.current = lookup;
  }, [lookup]);

  function requestCurrentLocation() {
    setMessage("");
    setWarning("");
    if (!navigator.geolocation) {
      setMessage(copy.unsupported);
      return;
    }

    setMode("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDraft({
          latitude,
          longitude,
          formattedAddress: "",
          emirate: "",
          city: "",
          area: "",
        });
        void lookup(latitude, longitude);
      },
      (error) => {
        setMode("idle");
        setMessage(error.code === error.PERMISSION_DENIED ? copy.denied : copy.unavailable);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      },
    );
  }

  function handleMapMove(lat: number, lng: number) {
    setDraft((prev) =>
      prev
        ? { ...prev, latitude: lat, longitude: lng }
        : {
            latitude: lat,
            longitude: lng,
            formattedAddress: "",
            emirate: "",
            city: "",
            area: "",
          },
    );
    window.clearTimeout(reverseTimerRef.current);
    reverseTimerRef.current = window.setTimeout(() => {
      void lookupRef.current(lat, lng, true);
    }, 700);
  }

  function applyDraft() {
    if (!draft?.emirate || !draft.formattedAddress) return;
    onConfirm(draft);
    setMode("idle");
    setMessage("");
    setWarning("");
  }

  const applied = Boolean(confirmed) && mode === "idle";
  const canApply = Boolean(draft?.emirate && draft.formattedAddress);
  const display = applied && confirmed ? confirmed : draft;
  const showMap = Boolean(display && (mode !== "idle" || confirmed));
  const interactive = mode === "editing";

  return (
    <div className="grid gap-3">
      <Button
        className="w-full sm:w-auto"
        loading={mode === "locating"}
        onClick={requestCurrentLocation}
        size="sm"
        type="button"
        variant="secondary"
      >
        <Icon name="map" size={16} />
        {copy.useMyLocation}
      </Button>
      <p className="text-xs text-muted">{copy.privacyHint}</p>

      {message ? (
        <p className="rounded-[var(--radius-md)] border border-border bg-surface-muted px-3 py-2 text-sm text-muted">
          {message}
        </p>
      ) : null}

      {showMap && display ? (
        <div className="grid gap-3 rounded-[var(--radius-xl)] border border-secondary/40 bg-secondary-soft/60 p-3">
          {mode !== "locating" ? (
            <div>
              <p className="text-sm font-black text-ink">{copy.detected}</p>
              <p className="mt-1 text-sm text-muted">{display.formattedAddress || copy.locating}</p>
              {display.emirate ? (
                <p className="mt-1 text-xs text-muted">
                  {display.area}
                  {display.area && display.emirate ? " — " : ""}
                  {display.emirate}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm font-medium text-muted">{copy.locating}</p>
          )}

          <CheckoutPinMap
            hint={copy.dragHint}
            interactive={interactive}
            label={copy.detected}
            lat={display.latitude}
            lng={display.longitude}
            onMove={interactive ? handleMapMove : undefined}
          />

          {warning ? <p className="text-xs font-medium text-error">{warning}</p> : null}

          {applied ? <p className="text-xs text-muted">{copy.applied}</p> : null}

          <div className="flex flex-wrap gap-2">
            {mode === "editing" ? (
              <Button disabled={!canApply} onClick={applyDraft} size="sm" type="button" variant="accent">
                {copy.useThisLocation}
              </Button>
            ) : null}
            <Button
              onClick={() => {
                setDraft(draft ?? confirmed);
                setMode("editing");
              }}
              size="sm"
              type="button"
              variant="secondary"
            >
              {copy.editLocation}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
