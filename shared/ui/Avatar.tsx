import { AppImage } from "@/shared/components/AppImage";

type AvatarSize = "sm" | "md" | "lg" | "xl";

type AvatarProps = {
  alt: string;
  className?: string;
  initials?: string;
  size?: AvatarSize;
  src?: string;
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-7 text-[0.6rem]",
  md: "size-9 text-xs",
  lg: "size-11 text-xs",
  xl: "size-20 text-2xl",
};

export function Avatar({
  alt,
  className = "",
  initials,
  size = "md",
  src,
}: AvatarProps) {
  const label = initials ?? alt.slice(0, 2);

  if (src) {
    return (
      <span
        className={`relative shrink-0 overflow-hidden rounded-full ring-2 ring-white ${sizeClasses[size]} ${className}`}
      >
        <AppImage
          alt={alt}
          className="object-cover"
          fallback="avatar"
          fill
          sizes={`${size === "xl" ? 80 : size === "lg" ? 44 : size === "md" ? 36 : 28}px`}
          src={src}
        />
      </span>
    );
  }

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-primary font-semibold text-white ${sizeClasses[size]} ${className}`}
    >
      {label}
    </span>
  );
}
