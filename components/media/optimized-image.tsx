"use client";

import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

type OptimizedImageProps = Omit<ImageProps, "alt"> & {
  alt: string;
  fallbackSrc?: string;
  className?: string;
};

/**
 * Responsive image with lazy loading defaults and graceful fallback.
 * Always requires alt text for accessibility / SEO.
 */
function OptimizedImage({
  alt,
  fallbackSrc = "/brand/icon.svg",
  className,
  onError,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      alt={alt}
      className={cn("object-cover", className)}
      loading={props.priority ? undefined : "lazy"}
      onError={(e) => {
        const img = e.currentTarget;
        if (fallbackSrc && img.src !== fallbackSrc) {
          img.src = fallbackSrc;
        }
        onError?.(e);
      }}
      {...props}
    />
  );
}

export { OptimizedImage };
