"use client";

import Image from "next/image";
import { useState } from "react";
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
  quality?: number;
  sizes?: string;
  src?: string;
  width?: number;
};

function isInlineImageSrc(src?: string) {
  return Boolean(src?.startsWith("data:") || src?.startsWith("blob:"));
}

function resolveFallbackUrl({
  fallback,
  fallbackCategory,
  fill,
  width,
}: Pick<AppImageProps, "fallback" | "fallbackCategory" | "fill" | "width">) {
  const size = fill ? 1200 : (width ?? 800);
  if (fallback === "avatar") return getFallbackUrl("avatar", fill ? 400 : (width ?? 800));
  if (fallback) return getFallbackUrl(fallback, size);
  if (fallbackCategory) return getCategoryFallbackUrl(fallbackCategory, size);
  return getFallbackUrl("default", size);
}

function AppImageInner({
  alt,
  className = "",
  fallback,
  fallbackCategory,
  fill = false,
  height = 600,
  loading,
  priority = false,
  quality,
  sizes = "(max-width: 768px) 100vw, 50vw",
  src,
  width = 800,
}: AppImageProps) {
  const fallbackUrl = resolveFallbackUrl({
    fallback,
    fallbackCategory,
    fill,
    width,
  });
  const [activeSrc, setActiveSrc] = useState(src || fallbackUrl);
  // Priority images must paint immediately — opacity gating delays LCP.
  const [isLoaded, setIsLoaded] = useState(priority || isInlineImageSrc(src));
  const [usedErrorFallback, setUsedErrorFallback] = useState(false);
  const useNativeImage = isInlineImageSrc(activeSrc);

  function handleError() {
    if (activeSrc !== fallbackUrl) {
      setActiveSrc(fallbackUrl);
      setUsedErrorFallback(true);
      if (!priority) setIsLoaded(false);
    }
  }

  const imageClassName = `object-cover ${className}`.trim();
  const wrapperClassName = `overflow-hidden ${fill ? "absolute inset-0" : "relative block"}`;
  const visibleClass = priority || isLoaded ? "opacity-100" : "opacity-0";

  return (
    <span className={wrapperClassName}>
      {!isLoaded && !priority ? (
        <span
          aria-hidden
          className={`absolute inset-0 skeleton ${fill ? "" : "min-h-[inherit]"}`}
        />
      ) : null}
      {useNativeImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={alt}
          className={`${imageClassName} ${priority ? "" : "transition-opacity duration-300"} ${visibleClass} ${fill ? "absolute inset-0 h-full w-full" : ""}`}
          height={fill ? undefined : height}
          loading={priority ? "eager" : loading ?? "lazy"}
          onError={handleError}
          onLoad={() => setIsLoaded(true)}
          src={activeSrc}
          width={fill ? undefined : width}
        />
      ) : (
        <Image
          alt={alt}
          className={`${imageClassName} ${priority ? "" : "transition-opacity duration-300"} ${visibleClass}`}
          fill={fill}
          height={fill ? undefined : height}
          loading={priority ? undefined : loading ?? "lazy"}
          onError={handleError}
          onLoad={() => setIsLoaded(true)}
          priority={priority}
          quality={quality ?? (priority ? 78 : 68)}
          sizes={sizes}
          src={activeSrc}
          width={fill ? undefined : width}
        />
      )}
      {usedErrorFallback && alt ? (
        <span className="sr-only">صورة بديلة لـ {alt}</span>
      ) : null}
    </span>
  );
}

export function AppImage(props: AppImageProps) {
  const resetKey = `${props.src ?? ""}-${props.fallback ?? ""}-${props.fallbackCategory ?? ""}`;
  return <AppImageInner key={resetKey} {...props} />;
}
