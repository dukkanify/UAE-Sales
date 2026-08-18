import { getListingVideoEmbed } from "@/shared/listings/listing-video";

type ListingVideoEmbedProps = {
  url: string;
};

export function ListingVideoEmbed({ url }: ListingVideoEmbedProps) {
  const embed = getListingVideoEmbed(url);

  if (!embed) {
    return (
      <div className="marketplace-panel mt-4 p-4">
        <p className="text-sm font-semibold text-ink">فيديو الإعلان</p>
        <a
          className="mt-1 block break-all text-sm font-medium text-primary underline-offset-2 hover:underline"
          href={url}
          rel="noopener noreferrer"
          target="_blank"
        >
          {url}
        </a>
      </div>
    );
  }

  if (embed.kind === "iframe") {
    return (
      <div className="marketplace-panel mt-4 overflow-hidden p-0">
        <div className="relative aspect-video w-full bg-black">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
            src={embed.src}
            title="فيديو الإعلان"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-panel mt-4 overflow-hidden p-0">
      <video
        className="aspect-video w-full bg-black"
        controls
        playsInline
        preload="metadata"
        src={embed.src}
      >
        المتصفح لا يدعم تشغيل الفيديو.
      </video>
    </div>
  );
}
