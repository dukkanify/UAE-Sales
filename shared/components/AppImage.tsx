"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";

type AppImageProps = {
  alt: string;
  className?: string;
  fill?: boolean;
  height?: number;
  priority?: boolean;
  sizes?: string;
  src?: string;
  width?: number;
};

export function AppImage({
  alt,
  className = "",
  fill = false,
  height = 600,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  src,
  width = 800,
}: AppImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`grid place-items-center bg-surface-muted text-muted ${className}`}
        role="img"
        aria-label={alt}
      >
        <Icon name="photo" size={32} />
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      fill={fill}
      height={fill ? undefined : height}
      onError={() => setHasError(true)}
      priority={priority}
      sizes={sizes}
      src={src}
      width={fill ? undefined : width}
    />
  );
}
