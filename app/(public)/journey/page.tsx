import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatIN } from "@/lib/format";
import { JOURNEY_CONTENT_CATEGORY } from "@/lib/domain";
import { absoluteUrl } from "@/lib/site";
import { getCurrentUser } from "@/lib/auth";
import { Badge, Reveal, SectionHeading, EmptyState } from "@/components/ui";
import { LogoMark } from "@/components/logo";
import {
  JOURNEY_HERO,
  JOURNEY_BEGINNINGS,
  JOURNEY_ERAS,
  JOURNEY_PILLARS,
  JOURNEY_TODAY,
  JOURNEY_NEXT,
  FOUNDER_NOTE_EMPTY,
  PLACEHOLDER_TAG,
  type JourneyEra,
} from "@/lib/journey";
import {
  Quote, ImageIcon, ShieldCheck, Leaf, ArrowRight, Info, CheckCircle2, HandHeart, CalendarDays,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Journey",
  description:
    "The story of Whispering Green Foundation — from its earliest community work to today's collection, awareness and verification work in Vasai-West.",
  alternates: { canonical: absoluteUrl("/journey") },
  openGraph: {
    title: "Our Journey · Whispering Green Foundation",
    description:
      "From community action to a growing movement for a cleaner, greener future — the Whispering Green Foundation story.",
    url: absoluteUrl("/journey"),
    type: "article",
  },
};

/** Founder's note + live verified total. Both are optional: the page renders without them. */
async function getJourneyData() {
  try {
    const [founderNote, verifiedRecords, viewer] = await Promise.all([
      prisma.content.findFirst({
        where: { category: JOURNEY_CONTENT_CATEGORY, status: "published" },
        orderBy: { publishedAt: "desc" },
        select: { title: true, excerpt: true, body: true, publishedAt: true },
      }),
      prisma.collectionRecord.findMany({
        where: { verificationStatus: "verified" },
        select: { quantity: true, unit: true },
      }),
      // Returns null straight away when there is no session cookie, so public
      // visitors cost no query.
      getCurrentUser(),
    ]);
    const kgRecords = verifiedRecords.filter((r) => r.unit === "kg");
    return {
      founderNote,
      totalKg: kgRecords.reduce((s, r) => s + r.quantity, 0),
      recordCount: verifiedRecords.length,
      hasImpact: verifiedRecords.length > 0,
      isStaff: Boolean(viewer),
      ok: true as const,
    };
  } catch {
    return {
      founderNote: null,
      totalKg: 0,
      recordCount: 0,
      hasImpact: false,
      isStaff: false,
      ok: false as const,
    };
  }
}

export default async function JourneyPage() {
  const { founderNote, totalKg, recordCount, hasImpact, ok, isStaff } = await getJourneyData();

  return (
    <div>
      {/* ------------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden border-b border-forest-100">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-forest-50 via-ivory to-ivory" />
          <div className="absolute -top-20 -left-24 w-[26rem] h-[26rem] rounded-full bg-leaf-200/25 blur-3xl" />
          <LeafTrail />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-16 sm:pt-20 sm:pb-20 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase bg-white border border-forest-100 text-forest-700 rounded-full px-3.5 py-1.5 shadow-soft">
              <Leaf className="w-3.5 h-3.5 text-leaf-600" /> {JOURNEY_HERO.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.6rem] font-semibold text-forest-950 leading-[1.08] tracking-tight mt-6">
              {JOURNEY_HERO.title}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="font-display text-xl sm:text-2xl text-forest-800 leading-snug mt-5 max-w-2xl mx-auto">
              {JOURNEY_HERO.subtitle}
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="text-charcoal-soft leading-relaxed mt-6 max-w-2xl mx-auto">{JOURNEY_HERO.intro}</p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="flex flex-wrap justify-center gap-3 mt-9">
              <Link href="/initiatives" className="btn btn-primary btn-lg">
                Explore our initiatives <ArrowRight className="w-4.5 h-4.5" />
              </Link>
              <Link href="/about" className="btn btn-secondary btn-lg">Read about the foundation</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- where it began */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24">
        <Reveal>
          <SectionHeading eyebrow={JOURNEY_BEGINNINGS.eyebrow} title={JOURNEY_BEGINNINGS.title} />
        </Reveal>

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
          <Reveal>
            <div className="card p-7 sm:p-8 h-full">
              <p className="font-display text-xl text-charcoal leading-snug">{JOURNEY_BEGINNINGS.lead}</p>
              <p className="text-charcoal-soft leading-relaxed mt-4 text-[0.95rem]">{JOURNEY_BEGINNINGS.body}</p>

              <dl className="mt-7 pt-6 border-t border-sage-200 space-y-4">
                {JOURNEY_BEGINNINGS.supporting.map((s) => (
                  <div key={s.label}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">{s.label}</dt>
                    <dd className="text-sm text-charcoal-soft mt-1 leading-relaxed">{s.text}</dd>
                  </div>
                ))}
              </dl>

              <p className="flex items-start gap-2 text-xs text-charcoal-soft/80 mt-6 bg-sage-50 border border-sage-200 rounded-xl px-3.5 py-3">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-bark" />
                <span>
                  Nothing on this page is guessed at. Bracketed text is a placeholder the foundation will replace with
                  verified facts — see{" "}
                  <Link href="/about" className="text-forest-700 underline underline-offset-2">how our numbers are made</Link>.
                </span>
              </p>
            </div>
          </Reveal>

          {/* From the Founder — authored by staff in Admin → Awareness content */}
          <Reveal delay={0.08}>
            <div className="relative card p-7 sm:p-8 h-full border-clay bg-parchment/60 overflow-hidden">
              <div aria-hidden className="absolute -right-6 -top-6 font-display text-[9rem] leading-none text-bark/10 select-none">
                ”
              </div>
              <Badge tone="leaf" className="relative">
                <Quote className="w-3 h-3" /> From the Founder
              </Badge>

              {founderNote ? (
                <div className="relative mt-5">
                  <h3 className="font-display text-xl font-semibold text-charcoal">{founderNote.title}</h3>
                  {founderNote.excerpt && (
                    <p className="text-[0.95rem] text-charcoal-soft italic mt-3 leading-relaxed">{founderNote.excerpt}</p>
                  )}
                  <div className="prose-eco mt-4 text-[0.95rem] whitespace-pre-line">{founderNote.body}</div>
                </div>
              ) : (
                <div className="relative mt-5">
                  <p className="font-display text-xl text-charcoal-soft leading-snug italic">
                    {FOUNDER_NOTE_EMPTY.title}
                  </p>
                  {/* The how-to names admin screens, so only signed-in staff see
                      it — a visitor gets the plain statement below instead. */}
                  {isStaff && (
                    <p className="text-xs text-charcoal-soft/80 mt-4 leading-relaxed flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-bark" />
                      <span>{FOUNDER_NOTE_EMPTY.hint}</span>
                    </p>
                  )}
                  <p className="text-xs text-charcoal-soft/70 mt-3">
                    We would rather leave this space empty than write an origin story for somebody else.
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------- the timeline */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24">
        <Reveal>
          <SectionHeading
            eyebrow="Early journey & milestones"
            title="The journey so far"
            sub="Each step below is either backed by a record or clearly marked as still awaiting verified information."
            center
          />
        </Reveal>

        <ol className="relative max-w-5xl mx-auto">
          <div aria-hidden className="timeline-rail absolute left-4 md:left-1/2 top-2 bottom-2 w-px md:-translate-x-1/2" />
          {JOURNEY_ERAS.map((era, i) => (
            <TimelineEntry key={era.id} era={era} side={i % 2 === 0 ? "left" : "right"} />
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------ growth & engagement */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24">
        <Reveal>
          <SectionHeading
            eyebrow="Growth & community engagement"
            title="What the work looks like now"
            sub="Six strands of activity, each one supported by a real part of this platform — no line here claims more than the site can show."
          />
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {JOURNEY_PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <Link href={p.href} className="card card-hover p-6 h-full flex flex-col group">
                <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mb-4">
                  <p.icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-charcoal">{p.title}</h3>
                <p className="text-sm text-charcoal-soft mt-2.5 leading-relaxed flex-1">{p.text}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-forest-700 mt-4 group-hover:gap-2.5 transition-all">
                  {p.cta} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ present day */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24">
        <Reveal>
          <SectionHeading eyebrow={JOURNEY_TODAY.eyebrow} title={JOURNEY_TODAY.title} sub={JOURNEY_TODAY.lead} />
        </Reveal>

        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
          <Reveal>
            <div className="card p-7 sm:p-8">
              <h3 className="font-display text-lg font-semibold text-charcoal">Keeping three things separate</h3>
              <ul className="mt-5 space-y-5">
                {JOURNEY_TODAY.distinctions.map((d) => (
                  <li key={d.label} className="flex gap-3.5">
                    <span className="w-9 h-9 rounded-full bg-leaf-100 border border-leaf-200 flex items-center justify-center text-leaf-700 shrink-0">
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{d.label}</p>
                      <p className="text-sm text-charcoal-soft mt-1 leading-relaxed">{d.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="card p-7 sm:p-8">
              <h3 className="font-display text-lg font-semibold text-charcoal flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-forest-600" /> Verified impact today
              </h3>
              {!ok ? (
                <div className="mt-5">
                  <EmptyState title="Impact figures unavailable" hint="The figures load from the foundation's database — try again shortly." />
                </div>
              ) : !hasImpact ? (
                <div className="mt-5">
                  <EmptyState title="No verified records yet" hint="Verified collection records will be summarised here." />
                </div>
              ) : (
                <>
                  <p className="font-display text-4xl font-semibold text-forest-800 mt-4">
                    {formatIN(totalKg)} <span className="text-lg font-normal text-charcoal-soft">kg</span>
                  </p>
                  <p className="text-sm text-charcoal-soft mt-1">
                    verified waste collected · {formatIN(recordCount)} verified {recordCount === 1 ? "record" : "records"}
                  </p>
                  <p className="text-xs text-charcoal-soft/80 mt-4 leading-relaxed">
                    Kilogram records only, each one weighed and re-checked. Requests, drafts and unverified entries are
                    excluded — the full method is on the{" "}
                    <Link href="/about" className="text-forest-700 underline underline-offset-2">about page</Link>.
                  </p>
                </>
              )}
              <Link href="/initiatives" className="btn btn-secondary btn-sm mt-6 w-full">
                See the projects behind these records
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- next chapter */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.6rem] bg-forest-900 text-forest-50 px-7 py-14 sm:px-14 sm:py-16">
            <div aria-hidden className="absolute inset-0 opacity-[0.07]">
              <LeafTrail dense />
            </div>
            <div className="relative max-w-3xl">
              <span className="inline-block text-xs font-semibold tracking-[0.14em] uppercase text-leaf-300 border border-forest-700 rounded-full px-3 py-1">
                {JOURNEY_NEXT.eyebrow}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-5 tracking-tight">{JOURNEY_NEXT.title}</h2>
              <div className="mt-5 space-y-4">
                {JOURNEY_NEXT.body.map((p) => (
                  <p key={p} className="text-forest-100/85 leading-relaxed">{p}</p>
                ))}
              </div>
              <p className="text-xs text-forest-300/75 mt-6 flex items-start gap-2 max-w-xl">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {JOURNEY_NEXT.note}
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                {JOURNEY_NEXT.ctas.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className={
                      c.variant === "primary"
                        ? "btn btn-leaf btn-lg"
                        : c.variant === "secondary"
                          ? "btn btn-lg bg-white/10 text-forest-50 border border-white/15 hover:bg-white/20"
                          : "btn btn-lg text-forest-50 hover:bg-white/10"
                    }
                  >
                    {c.variant === "primary" ? <ArrowRight className="w-5 h-5" /> :
                      c.variant === "secondary" ? <HandHeart className="w-5 h-5" /> :
                        <CalendarDays className="w-5 h-5" />}
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
            {/* Decorative mark — only from `lg`, where the CTA row can never
                reach it (below that the two collide at ~883px). */}
            <LogoMark className="hidden lg:block absolute right-10 bottom-10 w-16 h-16 rounded-2xl bg-white/95 p-1.5 shadow-soft" />
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ timeline card */

function TimelineEntry({ era, side }: { era: JourneyEra; side: "left" | "right" }) {
  const placeholder = era.source === "placeholder";
  return (
    <li className="relative pb-12 last:pb-0 md:grid md:grid-cols-2 md:gap-16">
      <span
        aria-hidden
        className={
          "absolute left-[9px] md:left-1/2 md:-translate-x-1/2 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-soft " +
          (placeholder ? "bg-clay" : "bg-leaf-400")
        }
      />
      {/* Both columns reserve the same gutter against the rail, so the cards on
          either side are identical in width and the rail sits centrally. */}
      <Reveal
        className={
          "pl-11 " + (side === "left" ? "md:col-start-1 md:pl-0 md:pr-6" : "md:col-start-2 md:pl-6")
        }
      >
        <article className="card p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-forest-50 text-forest-800 border-forest-200 font-semibold tracking-wide">
              {era.period}
            </span>
            {placeholder ? (
              <Badge tone="demo">{PLACEHOLDER_TAG}</Badge>
            ) : (
              <Badge tone="leaf">
                <CheckCircle2 className="w-3 h-3" /> Recorded
              </Badge>
            )}
          </div>

          <h3 className="font-display text-xl font-semibold text-charcoal mt-4">{era.title}</h3>
          <p className={"text-[0.95rem] leading-relaxed mt-2.5 " + (placeholder ? "text-charcoal-soft/75 italic" : "text-charcoal-soft")}>
            {era.summary}
          </p>

          <dl className="mt-5 space-y-3.5 border-t border-sage-200 pt-5">
            {[
              ["What happened", era.what],
              ["Why it mattered", era.why],
              ["Community involvement", era.community],
            ].map(([label, text]) => (
              <div key={label}>
                <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-forest-700">{label}</dt>
                <dd className={"text-sm mt-1 leading-relaxed " + (placeholder ? "text-charcoal-soft/70 italic" : "text-charcoal-soft")}>
                  {text}
                </dd>
              </div>
            ))}
          </dl>

          {/* media slot — deliberately shows what is missing rather than faking a photo */}
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-dashed border-sage-300 bg-sage-50/70 px-4 py-3.5">
            <ImageIcon className="w-4 h-4 text-charcoal-soft/60 shrink-0 mt-0.5" />
            <p className="text-xs text-charcoal-soft/80 leading-relaxed">
              <span className="font-medium text-charcoal-soft">Photo slot · </span>
              {era.media}
            </p>
          </div>

          {era.links && era.links.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {era.links.map((l) => (
                /* `btn-wrap` so a long label wraps inside the card instead of
                   pushing past its edge on a narrow screen. */
                <Link
                  key={l.href}
                  href={l.href}
                  className="btn btn-ghost btn-sm btn-wrap max-w-full"
                >
                  {l.label} <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </article>
      </Reveal>
    </li>
  );
}

/* --------------------------------------------------------------- leaf motif */

function LeafTrail({ dense }: { dense?: boolean }) {
  const leaves = dense ? 16 : 10;
  const W = 900;
  const H = 700;
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      {Array.from({ length: leaves }).map((_, i) => {
        const x = (((i * 43 + 11) % 100) / 100) * W;
        const y = (((i * 61 + 9) % 100) / 100) * H;
        const s = 12 + ((i * 23) % 24);
        return (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(s / 10).toFixed(2)})`} opacity={0.55}>
            <path
              d="M0 -8C4 -4 4 2 0 8C-4 2 -4 -4 0 -8Z"
              transform={`rotate(${(i * 53) % 360})`}
              fill="none"
              stroke="#4a8350"
              strokeOpacity="0.16"
              strokeWidth="1"
            />
          </g>
        );
      })}
    </svg>
  );
}
