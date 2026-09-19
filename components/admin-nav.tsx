"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Recycle, CalendarDays, Users, FolderKanban,
  Newspaper, Image as ImageIcon, Mail, UserCog, Settings,
} from "lucide-react";
import { cn } from "@/lib/format";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/requests", label: "Requests", icon: ClipboardList },
  { href: "/admin/collections", label: "Collections", icon: Recycle },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/volunteers", label: "Volunteers", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/content", label: "Content", icon: Newspaper },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/staff", label: "Staff", icon: UserCog, founderOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, founderOnly: true },
];

export function AdminNav({ role, unread, pending }: { role: string; unread: number; pending: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-col gap-0.5">
      {ITEMS.filter((i) => !i.founderOnly || role === "founder").map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
            active ? "bg-forest-100 text-forest-900 font-medium" : "text-charcoal-soft hover:bg-forest-50 hover:text-forest-900"
          )}
        >
          <item.icon className="w-4.5 h-4.5 shrink-0" />
          {item.label}
          {item.href === "/admin/requests" && pending > 0 && (
            <span className="ml-auto text-[0.65rem] font-semibold bg-amber-100 text-amber-800 rounded-full px-1.5 py-0.5">{pending}</span>
          )}
          {item.href === "/admin/messages" && unread > 0 && (
            <span className="ml-auto text-[0.65rem] font-semibold bg-leaf-200 text-leaf-700 rounded-full px-1.5 py-0.5">{unread}</span>
          )}
        </Link>
        );
      })}
    </nav>
  );
}
