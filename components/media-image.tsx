import Image from "next/image";
import { cn } from "@/lib/format";

/**
 * Renders approved media served by `/api/media/[id]`.
 *
 * Two paths on purpose:
 *  - Raster uploads (JPG/PNG/WebP, up to 5 MB) go through `next/image`, which
 *    resizes them to the size actually displayed, converts to WebP and lazy
 *    loads them. Without this the gallery would ship full-resolution uploads.
 *  - Local SVG artwork uses a plain `<img>`: the Next image optimizer refuses
 *    SVG by design, and these files are a couple of KB each, so re-enabling
 *    `dangerouslyAllowSVG` just to shave a few hundred bytes would be a bad
 *    trade.
 *
 * `fill` is used for raster media, so the caller must provide a positioned
 * container with an explicit aspect ratio (this is what removes layout shift).
 * This module has no "use client" directive, so it works from both server and
 * client components.
 */
export function MediaImage({
  id,
  alt,
  isVector,
  sizes,
  priority,
  className,
  onError,
}: {
  id: string;
  alt: string;
  isVector?: boolean;
  sizes: string;
  priority?: boolean;
  className?: string;
  onError?: () => void;
}) {
  const src = `/api/media/${id}`;
  const layout = "absolute inset-0 w-full h-full object-cover";

  if (isVector) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(layout, className)}
        onError={onError}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn(layout, className)}
      onError={onError}
    />
  );
}
