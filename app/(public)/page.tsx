import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatIN, formatDate } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/domain";
import { Reveal, SectionHeading, Badge, EmptyState } from "@/components/ui";
import { LogoMark } from "@/components/logo";
import {
  Recycle, ClipboardList, Truck, PartyPopper, ArrowRight, CalendarDays,
  BookOpen, Users, ShieldCheck, MapPin, Leaf, HandHeart, Info, PackageSearch,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Whispering Green Foundation — Community waste action in Vasai-West",
  description:
    "Request a household waste collection, join clean-up events, and learn practical waste habits with Whispering Green Foundation in Vasai-West.",
};

async function getHomeData() {
  try {
    const [verified, events, articles, projects] = await Promise.all([
      prisma.collectionRecord.findMany({
        where: { verificationStatus: "verified" },
        select: { quantity: true, unit: true },
      }),
      prisma.event.findMany({
        where: { status: "published", eventDate: { gte: new Date() } },
        orderBy: { eventDate: "asc" },
        take: 3,
      }),
      prisma.content.findMany({
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
      prisma.project.findMany({
        where: { visibility: "published" },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
    ]);
    return { verified, events, articles, projects, ok: true as const };
  } catch {
    return { verified: null, events: [], articles: [], projects: [], ok: false as const };
  }
}

const STEPS = [
  {
    icon: ClipboardList,
    title: "Submit a request",
    text: "Tell us what waste you have, roughly how much, and where in Vasai-West. It takes two minutes.",
  },
  {
    icon: Truck,
    title: "We review & schedule",
    text: "Our team reviews every request and schedules a pickup slot. You get a reference code to track it.",
  },
  {
    icon: PartyPopper,
    title: "Collection day",
    text: "Hand over the segregated waste at the agreed time. Our volunteers weigh and record it.",
  },
  {
    icon: Recycle,
    title: "Verified impact",
    text: "Only weighed, verified collection records count towards the community impact you see here.",
  },
];

export default async function HomePage() {
  const { verified, events, articles, projects, ok } = await getHomeData();

  // Only kg records are summed into the public tonnage; non-kg units (bags/other)
  // still count as verified records but cannot be expressed in kilograms.
  const totalKg = (verified ?? []).filter((r) => r.unit === "kg").reduce((s, r) => s + r.quantity, 0);
  const hasImpact = (verified?.length ?? 0) > 0;

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-forest-50 via-ivory to-ivory" />
          <div className="absolute -top-24 -right-24 w-[34rem] h-[34rem] rounded-full bg-leaf-200/30 blur-3xl" />
          <div className="absolute top-40 -left-32 w-[26rem] h-[26rem] rounded-full bg-forest-200/25 blur-3xl" />
          <LeafPattern />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase bg-white border border-forest-100 text-forest-700 rounded-full px-3.5 py-1.5 shadow-soft">
                <Leaf className="w-3.5 h-3.5 text-leaf-600" />
                Community waste action · Vasai-West
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold text-forest-950 leading-[1.08] tracking-tight mt-5">
                Greener streets begin with{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">one pickup</span>
                  <svg aria-hidden viewBox="0 0 220 12" className="absolute -bottom-1 left-0 w-full h-3 text-leaf-400/70" preserveAspectRatio="none">
                    <path d="M3 9C60 3 160 3 217 8" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                at a time
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="text-lg text-charcoal-soft leading-relaxed mt-6 max-w-xl">
                Whispering Green Foundation helps Vasai-West households get dry and plastic waste collected
                responsibly — and turns every verified kilogram into visible community impact.
              </p>
              <p className="text-sm text-charcoal-soft/80 leading-relaxed mt-3 max-w-xl flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                <span>
                  Every published figure is traced to a verified weighing record. Our current collection work is run
                  by a student team as part of their CEP Phase II (Eco Engineering) project —{" "}
                  <Link href="/about" className="text-forest-700 underline underline-offset-2 hover:text-forest-800">read how our numbers are made</Link>.
                </span>
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/request-collection" className="btn btn-primary btn-lg">
                  <HandHeart className="w-5 h-5" /> Request a collection
                </Link>
                <Link href="/initiatives" className="btn btn-secondary btn-lg">
                  Explore initiatives <ArrowRight className="w-4.5 h-4.5" />
                </Link>
                <Link href="/events" className="btn btn-ghost btn-lg">
                  <CalendarDays className="w-5 h-5 text-forest-600" /> Join an event
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <div className="mt-12 pt-8 border-t border-forest-100">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-charcoal-soft/70 mb-4">What would you like to do?</p>
                <div className="flex flex-wrap gap-2.5">
                  <Link href="/request-collection" className="chip-link">
                    <HandHeart className="w-4 h-4 text-forest-600" /> Book a household pickup
                  </Link>
                  <Link href="/track-request" className="chip-link">
                    <PackageSearch className="w-4 h-4 text-forest-600" /> Track my request
                  </Link>
                  <Link href="/events" className="chip-link">
                    <Users className="w-4 h-4 text-forest-600" /> Volunteer at a drive
                  </Link>
                  <Link href="/awareness" className="chip-link">
                    <BookOpen className="w-4 h-4 text-forest-600" /> Learn waste habits
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          {/* hero visual */}
          <Reveal delay={0.2} className="relative">
            <HeroVisual />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- impact summary */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6">
        <Reveal>
          <div className="card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-forest-600" /> Community impact
                </h2>
                <p className="text-sm text-charcoal-soft mt-1.5 max-w-xl">
                  Calculated from <strong>verified collection records only</strong>. Requests and unverified records are never counted.
                </p>
              </div>
              <Badge tone="demo">
                <Info className="w-3 h-3" /> Demo seed data
              </Badge>
            </div>

            {!ok ? (
              <div className="mt-6">
                <EmptyState title="Database not reachable" hint="Run `npm run db:setup` then restart the dev server." />
              </div>
            ) : !hasImpact ? (
              <div className="mt-6">
                <EmptyState
                  title="No verified collection records yet"
                  hint="Once staff verify collection records, verified totals will appear here."
                />
              </div>
            ) : (
              <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-7">
                <ImpactStat label="Waste collected (verified)" value={`${formatIN(totalKg)} kg`} />
                <ImpactStat label="Verified collection records" value={formatIN(verified?.length ?? 0)} />
                <ImpactStat label="Upcoming published events" value={String(events.length)} />
                <ImpactStat label="Awareness articles" value={String(articles.length)} />
              </dl>
            )}
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ how it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-20 sm:mt-24">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From doorstep to verified impact"
            sub="A simple, transparent flow — you always know what happens to your request."
          />
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="card card-hover p-6 h-full relative">
                <span className="absolute top-5 right-5 font-display text-4xl font-semibold text-forest-100 select-none">
                  {i + 1}
                </span>
                <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mb-4">
                  <s.icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-semibold text-charcoal">{s.title}</h3>
                <p className="text-sm text-charcoal-soft mt-2 leading-relaxed">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- projects */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-20 sm:mt-24">
        <Reveal>
          <div className="flex items-end justify-between gap-4 mb-10">
            <SectionHeading eyebrow="Our work" title="Featured initiatives" />
            <Link href="/initiatives" className="btn btn-ghost btn-sm mb-2 hidden sm:inline-flex">
              All initiatives <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
        {projects.length === 0 ? (
          <EmptyState title="No published initiatives yet" hint="Staff can publish projects from the admin dashboard." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.07}>
                <Link href={`/projects/${p.slug}`} className="card card-hover block p-6 h-full">
                  <Badge tone="green">{CATEGORY_LABELS[p.category] ?? p.category}</Badge>
                  <h3 className="font-display text-lg font-semibold text-charcoal mt-3">{p.title}</h3>
                  <p className="text-sm text-charcoal-soft mt-2 line-clamp-3">{p.description}</p>
                  <p className="flex items-center gap-1.5 text-xs text-charcoal-soft/75 mt-4">
                    <MapPin className="w-3.5 h-3.5" /> {p.locality}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- events */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-20 sm:mt-24">
        <Reveal>
          <div className="flex items-end justify-between gap-4 mb-10">
            <SectionHeading eyebrow="Get involved" title="Upcoming events" />
            <Link href="/events" className="btn btn-ghost btn-sm mb-2 hidden sm:inline-flex">
              All events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
        {events.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="w-5 h-5" />}
            title="No upcoming events right now"
            hint="Follow this page — new clean-up drives and awareness sessions are announced here."
            action={<Link href="/events" className="btn btn-secondary btn-sm">Browse past events</Link>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((e, i) => (
              <Reveal key={e.id} delay={i * 0.07}>
                <Link href={`/events/${e.slug}`} className="card card-hover block p-6 h-full">
                  <div className="flex items-center gap-2 text-xs text-forest-700 font-medium">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {formatDate(e.eventDate)}
                    {e.startTime && <span className="text-charcoal-soft/70">· {e.startTime}</span>}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-charcoal mt-2.5">{e.title}</h3>
                  <p className="text-sm text-charcoal-soft mt-1.5 line-clamp-2">{e.description}</p>
                  <p className="flex items-center gap-1.5 text-xs text-charcoal-soft/75 mt-4">
                    <MapPin className="w-3.5 h-3.5" /> {e.locality}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- awareness */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-20 sm:mt-24">
        <Reveal>
          <div className="flex items-end justify-between gap-4 mb-10">
            <SectionHeading eyebrow="Learn" title="Awareness & education" />
            <Link href="/awareness" className="btn btn-ghost btn-sm mb-2 hidden sm:inline-flex">
              All articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
        {articles.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-5 h-5" />}
            title="No published articles yet"
            hint="Awareness content on segregation, plastic and recycling will appear here."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.07}>
                <Link href={`/awareness/${a.slug}`} className="card card-hover block p-6 h-full">
                  <Badge tone="leaf">{a.category.replace(/_/g, " ")}</Badge>
                  <h3 className="font-display text-lg font-semibold text-charcoal mt-3">{a.title}</h3>
                  <p className="text-sm text-charcoal-soft mt-2 line-clamp-2">{a.excerpt}</p>
                  <p className="text-xs text-charcoal-soft/70 mt-4">{a.readMinutes} min read</p>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------ volunteer CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-20 sm:mt-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.6rem] bg-forest-900 text-forest-50 px-8 py-14 sm:px-14 text-center">
            <div aria-hidden className="absolute inset-0 opacity-[0.07]">
              <LeafPattern dense />
            </div>
            <LogoMark className="w-16 h-16 mx-auto rounded-2xl bg-white/95 p-1.5 shadow-soft" />
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-5 tracking-tight">
              Volunteer with us in Vasai-West
            </h2>
            <p className="text-forest-100/85 mt-4 max-w-xl mx-auto leading-relaxed">
              Join weekend clean-up drives, help with door-to-door awareness, or assist at collection points.
              Register for an upcoming event — no prior experience needed.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link href="/events" className="btn btn-leaf btn-lg">
                <Users className="w-5 h-5" /> See upcoming events
              </Link>
              <Link href="/contact" className="btn btn-ghost btn-lg text-forest-50 hover:bg-white/10">
                Get in touch
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function ImpactStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="font-display text-2xl sm:text-3xl font-semibold text-forest-800">{value}</dd>
      <dt className="text-xs text-charcoal-soft/80 mt-1">{label}</dt>
    </div>
  );
}

function LeafPattern({ dense }: { dense?: boolean }) {
  const leaves = dense ? 14 : 9;
  const W = 1000;
  const H = 600;
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      {Array.from({ length: leaves }).map((_, i) => {
        const x = ((i * 37 + 13) % 100) / 100 * W;
        const y = ((i * 53 + 7) % 100) / 100 * H;
        const s = 12 + ((i * 29) % 26);
        return (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(s / 10).toFixed(2)})`} opacity={0.5}>
            <path
              d="M0 -8C4 -4 4 2 0 8C-4 2 -4 -4 0 -8Z"
              transform={`rotate(${(i * 47) % 360})`}
              fill="none"
              stroke="#4a8350"
              strokeOpacity="0.18"
              strokeWidth="1"
            />
          </g>
        );
      })}
    </svg>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="glass rounded-[1.8rem] p-5 shadow-lift">
        <div className="rounded-2xl overflow-hidden relative bg-gradient-to-br from-forest-100 via-leaf-100 to-parchment aspect-[4/3.4]">
          {/* Local SVG illustration — no remote image dependency */}
          <svg viewBox="0 0 400 340" className="absolute inset-0 w-full h-full" aria-hidden>
            <circle cx="200" cy="150" r="86" fill="#e0ecdf" />
            <path d="M200 96c22 26 22 66 0 92-22-26-22-66 0-92Z" fill="#4a8350" opacity="0.85" />
            <path d="M148 188c26-18 66-22 96 0-30 22-70 18-96 0Z" fill="#67b13f" opacity="0.8" />
            <path d="M156 118c30-4 62 8 74 34-32 4-62-8-74-34Z" fill="#86c961" opacity="0.75" />
            <g stroke="#2c5332" strokeWidth="2.4" fill="#ffffff">
              <rect x="86" y="228" width="52" height="62" rx="8" />
              <rect x="150" y="212" width="58" height="78" rx="8" />
              <rect x="220" y="236" width="50" height="54" rx="8" />
              <rect x="282" y="222" width="54" height="68" rx="8" />
            </g>
            <g stroke="#4a8350" strokeWidth="2">
              <path d="M100 250h24M164 234h30M234 254h22M296 244h26" strokeLinecap="round" />
              <path d="M100 266h18M164 252h20M234 268h16M296 260h20" strokeLinecap="round" opacity="0.55" />
            </g>
            <path d="M60 300c40-14 90-20 140-20s100 6 140 20" stroke="#37683d" strokeWidth="3" fill="none" strokeLinecap="round" />
            <text x="200" y="326" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fill="#37683d" opacity="0.8">
              Segregate · Collect · Recycle
            </text>
          </svg>
        </div>
        <div className="flex items-center justify-between mt-4 px-1 gap-3 sm:pl-56">
          <p className="text-xs text-charcoal-soft/70 truncate">Community collection drive · illustration concept</p>
          <Badge tone="demo">Demo visual</Badge>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-5 glass rounded-2xl px-4 py-3 shadow-soft hidden sm:flex items-center gap-2.5">
        <Recycle className="w-5 h-5 text-forest-600" />
        <div>
          <p className="text-xs font-semibold text-charcoal">Verified records only</p>
          <p className="text-[0.68rem] text-charcoal-soft/75">No estimates inflate the numbers</p>
        </div>
      </div>
    </div>
  );
}
