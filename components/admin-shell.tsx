"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LeafMark } from "./logo";
import { Menu, X, LogOut, ChevronDown, KeyRound, ExternalLink, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/format";
import type { SessionUser } from "@/lib/auth";

export function AdminShell({
  user,
  nav,
  children,
  mustChangePassword,
}: {
  user: SessionUser;
  nav: ReactNode;
  children: ReactNode;
  mustChangePassword: boolean;
}) {
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setDrawer(false), [pathname]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const title =
    ITEMS_TITLES.find(([p]) => pathname === p || (p !== "/admin" && pathname.startsWith(p)))?.[1] ?? "Dashboard";

  return (
    <div className="min-h-screen bg-sage-50 flex">
      {/* sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-forest-100 bg-white">
        <div className="h-16 flex items-center px-5 border-b border-forest-50">
          <Link href="/" className="flex items-center gap-2.5 group">
            <LeafMark className="w-8 h-8 text-forest-800 group-hover:-rotate-6 transition-transform" />
            <div className="leading-tight">
              <p className="font-display font-semibold text-forest-900 text-[0.95rem]">Whispering Green</p>
              <p className="text-[0.6rem] tracking-[0.2em] uppercase text-charcoal-soft/70">Staff dashboard</p>
            </div>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{nav}</div>
        <div className="p-3 border-t border-forest-50">
          <Link href="/" className="btn btn-ghost btn-sm w-full text-xs">
            <ExternalLink className="w-3.5 h-3.5" /> View public site
          </Link>
        </div>
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div
            className="fixed inset-0 z-[80] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-forest-950/40 backdrop-blur-[2px]" onClick={() => setDrawer(false)} />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-lift flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-forest-50">
                <span className="font-display font-semibold text-forest-900">Menu</span>
                <button onClick={() => setDrawer(false)} aria-label="Close menu" className="btn btn-ghost btn-sm px-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">{nav}</div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white/90 backdrop-blur border-b border-forest-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden btn btn-ghost btn-sm px-2" onClick={() => setDrawer(true)} aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display text-lg font-semibold text-charcoal truncate">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-2 text-xs text-charcoal-soft/80 mr-1">
              <span className={cn("w-2 h-2 rounded-full", user.role === "founder" ? "bg-leaf-500" : "bg-sky-400")} />
              {user.role === "founder" ? "Founder" : "Staff"} · {user.name}
            </span>
            <div className="relative">
              <button
                onClick={() => setMenu((v) => !v)}
                className="btn btn-secondary btn-sm"
                aria-expanded={menu}
                aria-haspopup="menu"
              >
                Account <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {menu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-sage-200 rounded-xl shadow-lift p-1.5 z-20"
                      role="menu"
                    >
                      <div className="px-3 py-2 border-b border-sage-100">
                        <p className="text-sm font-medium text-charcoal truncate">{user.name}</p>
                        <p className="text-xs text-charcoal-soft/75 truncate">{user.email}</p>
                      </div>
                      <Link href="/admin/settings#password" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-forest-50" role="menuitem">
                        <KeyRound className="w-4 h-4 text-forest-600" /> Change password
                      </Link>
                      <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-red-700 w-full text-left" role="menuitem">
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {mustChangePassword && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-3 flex items-center gap-2.5 text-sm text-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>You&apos;re using the seeded demo password. Please <Link href="/admin/settings#password" className="font-semibold underline underline-offset-2">change it now</Link>.</span>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1200px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

const ITEMS_TITLES: Array<[string, string]> = [
  ["/admin", "Dashboard"],
  ["/admin/requests", "Collection requests"],
  ["/admin/collections", "Collection records"],
  ["/admin/events", "Events"],
  ["/admin/volunteers", "Volunteer registrations"],
  ["/admin/projects", "Projects"],
  ["/admin/content", "Awareness content"],
  ["/admin/gallery", "Gallery"],
  ["/admin/messages", "Messages"],
  ["/admin/staff", "Staff accounts"],
  ["/admin/settings", "Foundation settings"],
];
