import Link from "next/link";
import { cn } from "@/lib/format";

/**
 * Placeholder concept wordmark — NOT an official logo.
 * A simple two-stroke leaf paired with the foundation name.
 */
export function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 28C16 28 5 22.5 5 12.5C5 7 9.5 3.5 16 3.5C22.5 3.5 27 7 27 12.5C27 22.5 16 28 16 28Z"
        fill="url(#wgf-leaf-grad)"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M16 8.5V24M16 12.5C14 12.5 11.5 11 11.5 8.5C14 8.5 16 10 16 12.5ZM16 17C18 17 20.5 15.5 20.5 13C18 13 16 14.5 16 17Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <defs>
        <linearGradient id="wgf-leaf-grad" x1="5" y1="4" x2="27" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#86c961" />
          <stop offset="1" stopColor="#2c5332" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 group", className)} aria-label="Whispering Green Foundation — home">
      <LeafMark className="w-8 h-8 text-forest-800 transition-transform duration-300 group-hover:-rotate-6" />
      <span className={cn("leading-tight", compact && "sr-only")}>
        <span className="block font-display font-semibold text-forest-900 text-[1.05rem] tracking-tight">Whispering Green</span>
        <span className="block text-[0.66rem] tracking-[0.22em] uppercase text-charcoal-soft/75 -mt-0.5">Foundation</span>
      </span>
    </Link>
  );
}
