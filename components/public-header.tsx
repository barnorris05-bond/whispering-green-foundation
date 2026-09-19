"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, HandHeart, Leaf, CalendarDays } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/format";

export const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/initiatives", label: "Initiatives" },
  { href: "/events", label: "Events" },
  { href: "/awareness", label: "Awareness" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
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
        "sticky top-0 z-50 transition-all duration-300 border-b",
        scrolled ? "glass shadow-soft border-forest-100" : "bg-ivory/80 backdrop-blur-sm border-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Logo />

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-0.5">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative px-3.5 py-2 text-sm rounded-full transition-colors",
                  isActive(item.href) ? "text-forest-900 font-medium" : "text-charcoal-soft hover:text-forest-900 hover:bg-forest-50"
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-forest-100/80 border border-forest-200/70"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
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

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden border-t border-forest-100 bg-ivory/95 backdrop-blur-md"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {PUBLIC_NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.25 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-4 py-3 rounded-xl text-[0.95rem]",
                      isActive(item.href) ? "bg-forest-100 text-forest-900 font-medium" : "text-charcoal-soft hover:bg-forest-50"
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Link href="/request-collection" className="btn btn-primary btn-sm"><Leaf className="w-4 h-4" /> Request</Link>
                <Link href="/events" className="btn btn-secondary btn-sm"><CalendarDays className="w-4 h-4" /> Events</Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
