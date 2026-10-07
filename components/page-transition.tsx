"use client";

import { usePathname } from "next/navigation";

/**
 * Route-change transition.
 *
 * CSS keyframe (see globals.css) rather than an animation library — the
 * remount on `key` replays a short fade-in and nothing blocks rendering.
 * `prefers-reduced-motion` collapses it to its final state. Search-param
 * changes (filters, pagination) do not remount the tree.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
