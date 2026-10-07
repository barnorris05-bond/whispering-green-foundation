"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { cn } from "@/lib/format";

interface Item {
  id: string;
  /** true for local SVG artwork (served directly, not via the image optimizer). */
  isVector: boolean;
  caption?: string | null;
  alt: string;
  event?: string | null;
}

/** Every tile shares a 4:3 frame — matches the shipped artwork and removes layout shift. */
const SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

export function GalleryGrid({ items }: { items: Item[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [failed, setFailed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (openIdx == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null);
      if (e.key === "ArrowRight") setOpenIdx((i) => (i == null ? i : Math.min(items.length - 1, i + 1)));
      if (e.key === "ArrowLeft") setOpenIdx((i) => (i == null ? i : Math.max(0, i - 1)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx, items.length]);

  const current = openIdx != null ? items[openIdx] : null;
  const markFailed = (id: string) => setFailed((f) => new Set(f).add(id));

  return (
    <>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((m, i) => (
          <li key={m.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}>
            <button
              type="button"
              onClick={() => setOpenIdx(i)}
              className="group relative block w-full aspect-[4/3] rounded-2xl overflow-hidden border border-sage-200 bg-sage-100 shadow-soft hover:shadow-lift transition-shadow duration-300 focus-visible:outline-2 focus-visible:outline-forest-500 focus-visible:outline-offset-2 text-left"
              aria-label={`Open photo${m.caption ? `: ${m.caption}` : ""}`}
            >
              {failed.has(m.id) ? (
                <span className="absolute inset-0 flex flex-col items-center justify-center text-charcoal-soft/60 gap-2 p-4">
                  <ImageOff className="w-6 h-6" />
                  <span className="text-xs text-center">Image unavailable</span>
                </span>
              ) : (
                <MediaImage
                  id={m.id}
                  alt={m.alt}
                  isVector={m.isVector}
                  sizes={SIZES}
                  className="transition-transform duration-500 group-hover:scale-[1.04]"
                  onError={() => markFailed(m.id)}
                />
              )}
              {m.caption && !failed.has(m.id) && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/80 to-transparent p-3 pt-10 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
                  <span className="block text-xs text-white line-clamp-2">{m.caption}</span>
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4 sm:p-10 bg-forest-950/85 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpenIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label={current.caption ?? "Photo"}
        >
          <figure
            className="max-w-4xl w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mx-auto max-w-3xl aspect-[4/3] rounded-2xl overflow-hidden bg-forest-950">
              <MediaImage
                id={current.id}
                alt={current.alt}
                isVector={current.isVector}
                sizes="(min-width: 768px) 768px, 100vw"
                priority
              />
            </div>
            <figcaption className="text-center text-forest-100/90 text-sm mt-4">
              {current.caption}
              {current.event && <span className="block text-xs text-forest-300/70 mt-1">From: {current.event}</span>}
            </figcaption>
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => setOpenIdx((i) => (i! > 0 ? i! - 1 : i))}
                disabled={openIdx === 0}
                className={cn("btn btn-sm bg-white/10 text-white hover:bg-white/20 border border-white/15", openIdx === 0 && "opacity-40")}
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button autoFocus onClick={() => setOpenIdx(null)} className="btn btn-sm bg-white/10 text-white hover:bg-white/20 border border-white/15">
                Close
              </button>
              <button
                onClick={() => setOpenIdx((i) => (i! < items.length - 1 ? i! + 1 : i))}
                disabled={openIdx === items.length - 1}
                className={cn("btn btn-sm bg-white/10 text-white hover:bg-white/20 border border-white/15", openIdx === items.length - 1 && "opacity-40")}
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </figure>
        </div>
      )}
    </>
  );
}
