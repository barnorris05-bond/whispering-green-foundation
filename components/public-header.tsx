"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, HandHeart, Leaf, CalendarDays } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/format";

/**
 * Primary public navigation.
 *
 * Keep this list short — it has to fit beside the logo and the "Request
 * collection" button at the 1024px breakpoint. `Home` is first, and the
 * journey sits directly after `About` because the two pages read as a pair.
 */
export const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/journey", label: "Our Journey" },
  { href: "/initiatives", label: "Initiatives" },
  { href: "/events", label: "Events" },
  { href: "/awareness", label: "Awareness" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
  // Donate sits last with a slightly stronger tint — an important action,
  // but styled as part of the nav, never as a shop link.
  { href: "/donate", label: "Donate" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300",
        scrolled ? "glass shadow-soft border-forest-100" : "bg-ivory/80 backdrop-blur-sm border-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-2 h-16">
          <Logo priority />

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-0.5">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "px-2 xl:px-3 py-2 text-sm rounded-full border transition-colors",
                  isActive(item.href)
                    ? "text-forest-900 font-medium bg-forest-100/80 border-forest-200/70"
                    : item.href === "/donate"
                      ? "text-forest-800 font-medium bg-leaf-100/60 border-leaf-300/70 hover:bg-leaf-100 hover:border-leaf-400"
                      : "text-charcoal-soft border-transparent hover:text-forest-900 hover:bg-forest-50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/request-collection" className="btn btn-primary btn-sm hidden sm:inline-flex">
              <HandHeart className="w-4 h-4" /> Request collection
            </Link>
            <button
              className="lg:hidden btn btn-ghost btn-sm px-2.5"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="lg:hidden border-t border-forest-100 bg-ivory/95 backdrop-blur-md animate-drop-in origin-top"
        >
          <div className="px-4 py-4 flex flex-col gap-1">
            {PUBLIC_NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ animationDelay: `${Math.min(i * 30, 180)}ms` }}
                className={cn(
                  "block px-4 py-3 rounded-xl text-[0.95rem] animate-fade-in",
                  isActive(item.href)
                    ? "bg-forest-100 text-forest-900 font-medium"
                    : item.href === "/donate"
                      ? "bg-leaf-100/70 text-forest-800 font-medium border border-leaf-200"
                      : "text-charcoal-soft hover:bg-forest-50"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Link href="/request-collection" className="btn btn-primary btn-sm"><Leaf className="w-4 h-4" /> Request</Link>
              <Link href="/events" className="btn btn-secondary btn-sm"><CalendarDays className="w-4 h-4" /> Events</Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
