import { prisma } from "@/lib/db";
import { Badge, EmptyState } from "@/components/ui";
import { Image as ImageIcon, Plus } from "lucide-react";
import { MediaManager } from "./media-manager";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    include: { event: { select: { title: true } } },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-charcoal">Gallery</h2>
          <p className="text-sm text-charcoal-soft mt-1">
            Upload photos with captions and alt text. Only “approved” media is public.
          </p>
        </div>
        <MediaManager
          mode="upload"
          trigger={<span className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> Upload photo</span>}
          events={[]}
          projects={[]}
        />
      </div>

      {media.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="w-5 h-5" />}
          title="No photos uploaded"
          hint="Upload event or drive photos (JPG/PNG/WebP, max 5 MB)."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((m) => (
            <div key={m.id} className="card overflow-hidden">
              <div className="aspect-[4/3] bg-sage-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/media/${m.id}`} alt={m.altText ?? "Gallery photo"} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={m.visibility === "approved" ? "leaf" : m.visibility === "pending" ? "amber" : "gray"}>
                    {m.visibility}
                  </Badge>
                  {m.event && <span className="text-[0.65rem] text-charcoal-soft/70 truncate">{m.event.title}</span>}
                </div>
                <p className="text-xs text-charcoal-soft mt-2 line-clamp-2">{m.caption ?? <span className="opacity-50">No caption</span>}</p>
                <div className="mt-3">
                  <MediaManager
                    mode="edit"
                    trigger={<span className="btn btn-secondary btn-sm w-full">Manage</span>}
                    media={{
                      id: m.id,
                      caption: m.caption ?? "",
                      altText: m.altText ?? "",
                      visibility: m.visibility,
                      eventId: m.eventId ?? "",
                      projectId: m.projectId ?? "",
                    }}
                    events={[]}
                    projects={[]}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
