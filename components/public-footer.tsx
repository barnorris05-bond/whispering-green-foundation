import Link from "next/link";
import { prisma } from "@/lib/db";
import { LogoOnDark } from "./logo";
import { Mail, Phone, MapPin, ShieldAlert } from "lucide-react";

/** Two short groups read better than one long list on a dark surface. */
const EXPLORE_LINKS: Array<[string, string]> = [
  ["/about", "About us"],
  ["/journey", "Foundation Journey"],
  ["/initiatives", "Initiatives & projects"],
  ["/awareness", "Awareness portal"],
  ["/gallery", "Gallery"],
];

const TAKE_PART_LINKS: Array<[string, string]> = [
  ["/donate", "Donate"],
  ["/request-collection", "Request collection"],
  ["/track-request", "Track a request"],
  ["/contact", "Contact us"],
];

export async function PublicFooter() {
  let settings: {
    displayName: string;
    tagline: string;
    contactEmail: string | null;
    contactPhone: string | null;
    publicLocation: string | null;
    socialFacebook: string | null;
    socialInstagram: string | null;
    footerNote: string | null;
  } | null = null;
  try {
    settings = await prisma.foundationSettings.findFirst();
  } catch {
    // DB not ready — the footer still renders with clearly-labelled placeholders
  }

  const name = settings?.displayName || "Whispering Green Foundation";
  const email = settings?.contactEmail || null;
  const phone = settings?.contactPhone || null;
  const location = settings?.publicLocation || "Vasai-West, Palghar, Maharashtra";
  // Social links only appear once staff actually set them in Admin → Settings —
  // we never render a link to a profile that may not exist.
  const socials = [
    { href: settings?.socialFacebook, label: "Facebook" },
    { href: settings?.socialInstagram, label: "Instagram" },
  ].filter((s): s is { href: string; label: string } => Boolean(s.href));

  return (
    <footer className="bg-forest-950 text-forest-100 mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr]">
        <div>
          <LogoOnDark />
          <p className="text-sm text-forest-200/85 mt-4 max-w-sm leading-relaxed">
            {settings?.footerNote ??
              settings?.tagline ??
              "A community-led initiative for household waste collection and environmental awareness in Vasai-West."}
          </p>
          <p className="text-sm text-leaf-300/90 mt-4 max-w-sm leading-relaxed">
            Segregate · Collect · Recycle — and only publish what we can verify.
          </p>

          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-2 mt-5">
              {socials.map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center rounded-full border border-forest-800 px-3 py-1.5 text-xs text-forest-200 hover:text-leaf-300 hover:border-forest-700 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Explore" className="text-sm">
          <p className="font-semibold text-white mb-3">Explore</p>
          <ul className="space-y-2 text-forest-200/85">
            {EXPLORE_LINKS.map(([href, label]) => (
              <li key={label}>
                <Link href={href} className="hover:text-leaf-300 transition-colors rounded px-0.5">{label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Take part" className="text-sm">
          <p className="font-semibold text-white mb-3">Take part</p>
          <ul className="space-y-2 text-forest-200/85">
            {TAKE_PART_LINKS.map(([href, label]) => (
              <li key={label}>
                <Link href={href} className="hover:text-leaf-300 transition-colors rounded px-0.5">{label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm">
          <p className="font-semibold text-white mb-3">Contact</p>
          <ul className="space-y-2.5 text-forest-200/85">
            {email ? (
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-leaf-300 shrink-0" />
                <a href={`mailto:${email}`} className="break-all hover:text-leaf-300 transition-colors rounded px-0.5">{email}</a>
              </li>
            ) : (
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-leaf-300 shrink-0" />
                <span className="text-forest-300/70">Email — to be added in Admin → Settings</span>
              </li>
            )}
            {phone ? (
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-leaf-300 shrink-0" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-leaf-300 transition-colors rounded px-0.5">{phone}</a>
              </li>
            ) : (
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-leaf-300 shrink-0" />
                <span className="text-forest-300/70">Phone — to be added in Admin → Settings</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-leaf-300 shrink-0" />
              <span>{location}</span>
            </li>
          </ul>
          <Link
            href="/login"
            className="inline-block mt-5 text-xs text-forest-300/70 hover:text-leaf-300 underline underline-offset-4 rounded px-0.5"
          >
            Staff login
          </Link>
        </div>
      </div>

      <div className="border-t border-forest-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-xs text-forest-300/60 space-y-2.5">
          <p className="flex items-start gap-2 max-w-3xl">
            <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              This is a local demonstration build. Contact details stay as placeholders until staff set them in
              Admin → Settings, and registration or legal details will be published here once the foundation
              provides them.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <span>© {new Date().getFullYear()} {name} · Demonstration build</span>
            <span>Impact figures on this site come from verified collection records only.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
