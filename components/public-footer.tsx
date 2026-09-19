import Link from "next/link";
import { prisma } from "@/lib/db";
import { LeafMark } from "./logo";
import { Mail, Phone, MapPin, ShieldAlert } from "lucide-react";

export async function PublicFooter() {
  let settings: { contactEmail: string | null; contactPhone: string | null; publicLocation: string | null; footerNote: string | null } | null = null;
  try {
    settings = await prisma.foundationSettings.findFirst();
  } catch {
    // DB not ready — footer still renders with placeholders
  }

  const email = settings?.contactEmail || "hello@example.org (placeholder — set in Admin → Settings)";
  const phone = settings?.contactPhone || "+91 XXXXX XXXXX (placeholder)";
  const location = settings?.publicLocation || "Vasai-West, Palghar, Maharashtra (placeholder)";

  return (
    <footer className="bg-forest-950 text-forest-100 mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LeafMark className="w-9 h-9 text-leaf-300" />
            <div>
              <p className="font-display font-semibold text-lg text-white leading-tight">Whispering Green Foundation</p>
              <p className="text-[0.66rem] tracking-[0.22em] uppercase text-forest-300/80">Placeholder wordmark · concept</p>
            </div>
          </div>
          <p className="text-sm text-forest-200/85 mt-4 max-w-sm leading-relaxed">
            {settings?.footerNote ??
              "A community-led initiative for household waste collection and environmental awareness in Vasai-West."}
          </p>
          <p className="flex items-start gap-2 text-xs text-forest-300/70 mt-5 max-w-sm">
            <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            This is a local demonstration build. Contact details shown here are editable placeholders unless set by staff in Admin → Settings.
          </p>
        </div>

        <nav aria-label="Footer" className="text-sm">
          <p className="font-semibold text-white mb-3">Explore</p>
          <ul className="space-y-2 text-forest-200/85">
            {[
              ["/initiatives", "Initiatives & projects"],
              ["/events", "Events"],
              ["/awareness", "Awareness portal"],
              ["/gallery", "Gallery"],
              ["/request-collection", "Request collection"],
              ["/track-request", "Track a request"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-leaf-300 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm">
          <p className="font-semibold text-white mb-3">Contact</p>
          <ul className="space-y-2.5 text-forest-200/85">
            <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 text-leaf-300 shrink-0" /><span className="break-all">{email}</span></li>
            <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 text-leaf-300 shrink-0" />{phone}</li>
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-leaf-300 shrink-0" />{location}</li>
          </ul>
          <Link href="/login" className="inline-block mt-5 text-xs text-forest-300/70 hover:text-leaf-300 underline underline-offset-4">
            Staff login
          </Link>
        </div>
      </div>
      <div className="border-t border-forest-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-xs text-forest-300/60 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Whispering Green Foundation · Demonstration build</span>
          <span>Impact figures on this site come from verified collection records only.</span>
        </div>
      </div>
    </footer>
  );
}
