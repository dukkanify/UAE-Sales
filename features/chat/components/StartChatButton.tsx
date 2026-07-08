"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Listing } from "@/types";
import { openListingConversation } from "@/services/chat";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";

type StartChatButtonProps = {
  className?: string;
  fullWidth?: boolean;
  listing: Listing;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "accent";
};

export function StartChatButton({
  className,
  fullWidth = false,
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

      if (user.id === listing.seller.id) {
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
        محادثة البائع
      </Button>
      {error ? (
        <div className="mt-2">
          <FormMessage variant="error">{error}</FormMessage>
        </div>
      ) : null}
    </div>
  );
}
