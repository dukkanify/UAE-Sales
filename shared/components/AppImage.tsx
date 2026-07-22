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
  const [isLoaded, setIsLoaded] = useState(isInlineImageSrc(src));
  const [usedErrorFallback, setUsedErrorFallback] = useState(false);
  const useNativeImage = isInlineImageSrc(activeSrc);

  function handleError() {
    if (activeSrc !== fallbackUrl) {
      setActiveSrc(fallbackUrl);
      setUsedErrorFallback(true);
      setIsLoaded(false);
    }
  }

  const imageClassName = `object-cover ${className}`.trim();
  const wrapperClassName = `overflow-hidden ${fill ? "absolute inset-0" : "relative block"}`;

  return (
    <span className={wrapperClassName}>
      {!isLoaded ? (
        <span
          aria-hidden
          className={`absolute inset-0 skeleton ${fill ? "" : "min-h-[inherit]"}`}
        />
      ) : null}
      {useNativeImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={alt}
          className={`${imageClassName} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"} ${fill ? "absolute inset-0 h-full w-full" : ""}`}
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
