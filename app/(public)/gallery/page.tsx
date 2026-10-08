import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Reveal, SectionHeading, EmptyState } from "@/components/ui";
import { absoluteUrl } from "@/lib/site";
import { GalleryGrid } from "./gallery-grid";
import { ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from Whispering Green Foundation collection drives and community work.",
  alternates: { canonical: absoluteUrl("/gallery") },
  openGraph: {
    title: "Gallery · Whispering Green Foundation",
    description: "Moments from community collection drives across Vasai-West.",
    url: absoluteUrl("/gallery"),
    type: "website",
  },
};

export default async function GalleryPage() {
  const media = await prisma.media.findMany({
    where: { visibility: "approved" },
    orderBy: { createdAt: "desc" },
    include: { event: { select: { title: true, slug: true } } },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
      <Reveal>
        <SectionHeading
          eyebrow="Community"
          title="Gallery"
          sub="Moments from our collection drives and community work. Only approved media is published."
        />
      </Reveal>

      {media.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="w-5 h-5" />}
          title="No photos yet"
          hint="Staff can upload photos from the admin gallery with captions and alt text."
        />
      ) : (
      <GalleryGrid
        items={media.map((m) => ({
          id: m.id,
          // Local SVG artwork bypasses the image optimizer; uploads are re-encoded.
          isVector: m.storagePath.startsWith("artwork:"),
          caption: m.caption,
          alt: m.altText ?? m.caption ?? "Gallery photo",
          event: m.event?.title,
        }))}
      />
      )}
    </div>
  );
}
