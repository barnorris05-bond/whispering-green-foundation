"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

interface Item {
  id: string;
  src: string;
  caption?: string | null;
  alt: string;
  event?: string | null;
}

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

  return (
    <>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 [column-fill:balance]">
        {items.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: (i % 8) * 0.05 }}
            onClick={() => setOpenIdx(i)}
            className="mb-4 w-full break-inside-avoid text-left group focus-visible:outline-2 focus-visible:outline-forest-500 rounded-2xl"
            aria-label={`Open photo${m.caption ? `: ${m.caption}` : ""}`}
          >
            <div className="relative rounded-2xl overflow-hidden border border-sage-200 bg-sage-100 shadow-soft group-hover:shadow-lift transition-shadow duration-300">
              {failed.has(m.id) ? (
                <div className="aspect-[4/3] flex flex-col items-center justify-center text-charcoal-soft/60 gap-2 p-4">
                  <ImageOff className="w-6 h-6" />
                  <p className="text-xs text-center">Image unavailable</p>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={m.src}
                  alt={m.alt}
                  loading="lazy"
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.03]"
                  onError={() => setFailed((f) => new Set(f).add(m.id))}
                />
              )}
              {m.caption && !failed.has(m.id) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/75 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">{m.caption}</p>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center p-4 sm:p-10 bg-forest-950/85 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenIdx(null)}
            role="dialog"
            aria-modal="true"
            aria-label={current.caption ?? "Photo"}
          >
            <motion.figure
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.src} alt={current.alt} className="max-h-[72vh] w-auto mx-auto rounded-2xl shadow-lift bg-forest-950" />
              <figcaption className="text-center text-forest-100/90 text-sm mt-4">
                {current.caption}
                {current.event && <span className="block text-xs text-forest-300/70 mt-1">From: {current.event}</span>}
              </figcaption>
              <div className="flex items-center justify-center gap-3 mt-5">
                <button onClick={() => setOpenIdx((i) => (i! > 0 ? i! - 1 : i))} className="btn btn-sm bg-white/10 text-white hover:bg-white/20 border border-white/15" aria-label="Previous photo">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setOpenIdx(null)} className="btn btn-sm bg-white/10 text-white hover:bg-white/20 border border-white/15">
                  Close
                </button>
                <button onClick={() => setOpenIdx((i) => (i! < items.length - 1 ? i! + 1 : i))} className="btn btn-sm bg-white/10 text-white hover:bg-white/20 border border-white/15" aria-label="Next photo">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
