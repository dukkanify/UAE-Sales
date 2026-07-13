"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Listing } from "@/types";
import { openListingConversation } from "@/services/chat";
import { isOwnListing } from "@/shared/listings/listing-ownership";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";

type StartChatButtonProps = {
  className?: string;
  fullWidth?: boolean;
  iconOnly?: boolean;
  layout?: "default" | "icon" | "stacked";
  listing: Listing;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "accent";
};

export function StartChatButton({
  className,
  fullWidth = false,
  iconOnly = false,
  layout = "default",
  listing,
  size = "md",
  variant = "secondary",
}: StartChatButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    setIsLoading(true);

    try {
      const user = getSessionUser();
      if (!user) {
        const returnPath = listing.id.startsWith("local-")
          ? `/listings/local/${listing.id}`
          : `/listings/${listing.slug}`;
        router.push(`/login?next=${encodeURIComponent(returnPath)}`);
        return;
      }

      if (isOwnListing(listing, user)) {
        setError("لا يمكنك مراسلة نفسك بخصوص إعلانك.");
        return;
      }

      const conversationId = openListingConversation(listing, {
        id: user.id,
        name: user.fullName,
      });
      router.push(`/chat/${conversationId}`);
    } catch {
      setError("تعذر فتح المحادثة. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  }

  const resolvedLayout = layout === "default" && iconOnly ? "icon" : layout;

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <Button
        className={className}
        fullWidth={fullWidth}
        loading={isLoading}
        onClick={handleClick}
        size={size}
        type="button"
        variant={variant}
      >
        {resolvedLayout === "icon" ? (
          <Icon name="message" size={20} />
        ) : resolvedLayout === "stacked" ? (
          <>
            <span className="grid size-8 place-items-center rounded-full bg-primary/8 text-primary">
              <Icon name="message" size={17} />
            </span>
            <span className="text-[0.625rem] font-bold leading-none text-ink">محادثة</span>
          </>
        ) : (
          "محادثة البائع"
        )}
      </Button>
      {error ? (
        <div className="mt-2">
          <FormMessage variant="error">{error}</FormMessage>
        </div>
      ) : null}
    </div>
  );
}
