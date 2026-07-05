"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  getCategoryFallbackUrl,
  getFallbackUrl,
  type ImageFallbackCategory,
} from "@/shared/constants/image-fallbacks";

type AppImageProps = {
  alt: string;
  className?: string;
  fallback?: ImageFallbackCategory | "avatar";
  fallbackCategory?: string;
  fill?: boolean;
  height?: number;
  loading?: "eager" | "lazy";
  priority?: boolean;
  sizes?: string;
  src?: string;
  width?: number;
};

function AppImageInner({
  alt,
  className = "",
  fallback,
  fallbackCategory,
  fill = false,
  height = 600,
  loading,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  src,
  width = 800,
}: AppImageProps) {
  const fallbackUrl = useMemo(() => {
    if (fallback === "avatar") {
      return getFallbackUrl("avatar", fill ? 400 : width);
    }
    if (fallback) {
      return getFallbackUrl(fallback, fill ? 1200 : width);
    }
    if (fallbackCategory) {
      return getCategoryFallbackUrl(fallbackCategory, fill ? 1200 : width);
    }
    return getFallbackUrl("default", fill ? 1200 : width);
  }, [fallback, fallbackCategory, fill, width]);

  const [activeSrc, setActiveSrc] = useState(src || fallbackUrl);
  const [isLoaded, setIsLoaded] = useState(false);
  const usingFallback = activeSrc === fallbackUrl;

  function handleError() {
    if (activeSrc !== fallbackUrl) {
      setActiveSrc(fallbackUrl);
      setIsLoaded(false);
    }
  }

  const imageClassName = `object-cover ${className}`.trim();

  return (
    <span
      className={`overflow-hidden ${fill ? "absolute inset-0" : "relative block"}`}
    >
      {!isLoaded ? (
        <span
          aria-hidden
          className={`absolute inset-0 skeleton ${fill ? "" : "min-h-[inherit]"}`}
        />
      ) : null}
      <Image
        alt={alt}
        className={`${imageClassName} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        fill={fill}
        height={fill ? undefined : height}
        loading={priority ? undefined : loading ?? "lazy"}
        onError={handleError}
        onLoad={() => setIsLoaded(true)}
        priority={priority}
        sizes={sizes}
        src={activeSrc}
        width={fill ? undefined : width}
      />
      {usingFallback ? (
        <span className="sr-only">صورة بديلة لـ {alt}</span>
      ) : null}
    </span>
  );
}

export function AppImage(props: AppImageProps) {
  const resetKey = `${props.src ?? ""}-${props.fallback ?? ""}-${props.fallbackCategory ?? ""}`;
  return <AppImageInner key={resetKey} {...props} />;
}
