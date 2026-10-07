import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/format";
import { Reveal, SectionHeading } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";
import {
  AFTER_DONATE,
  BANK_FIELDS,
  BANK_SECTION,
  DONATE_HERO,
  DONATE_INTRO,
  DONATE_STEPS,
  NO_PAYMENT_NOTICE,
} from "@/lib/donate";
import { ArrowRight, CheckCircle2, HandHeart, Info, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Whispering Green Foundation through a direct bank transfer — official account details, simple steps and guidance for giving safely.",
  alternates: { canonical: absoluteUrl("/donate") },
  openGraph: {
    title: "Donate · Whispering Green Foundation",
    description:
      "Your support can help Whispering Green Foundation continue its community and environmental initiatives.",
    url: absoluteUrl("/donate"),
    type: "website",
  },
};

export default function DonatePage() {
  return (
    <div>
      {/* ------------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden border-b border-forest-100">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-forest-50 via-ivory to-ivory" />
          <div className="absolute -top-20 -right-24 w-[26rem] h-[26rem] rounded-full bg-leaf-200/25 blur-3xl" />
          <LeafTrail />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-16 sm:pt-20 sm:pb-20 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase bg-white border border-forest-100 text-forest-700 rounded-full px-3.5 py-1.5 shadow-soft">
              <HandHeart className="w-3.5 h-3.5 text-leaf-600" aria-hidden /> {DONATE_HERO.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.6rem] font-semibold text-forest-950 leading-[1.08] tracking-tight mt-6">
              {DONATE_HERO.title}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="font-display text-xl sm:text-2xl text-forest-800 leading-snug mt-5 max-w-2xl mx-auto">
              {DONATE_HERO.subtitle}
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="flex flex-wrap justify-center gap-3 mt-9">
              <a href="#bank-details" className="btn btn-primary btn-lg">
                {DONATE_HERO.primaryCta} <ArrowRight className="w-4.5 h-4.5" aria-hidden />
              </a>
              <Link href="/journey" className="btn btn-secondary btn-lg">
                {DONATE_HERO.secondaryCta}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="flex items-center justify-center gap-2 text-sm text-charcoal-soft mt-6 max-w-md mx-auto">
              <ShieldCheck className="w-4 h-4 text-leaf-600 shrink-0" aria-hidden />
              <span className="text-left">{DONATE_HERO.trustNote}</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------- intro */}
      <section aria-label="Support our work" className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 sm:pt-16">
        <Reveal>
          <SectionHeading eyebrow="Our work" title={DONATE_INTRO.title} center />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="space-y-4 text-charcoal-soft leading-relaxed">
            {DONATE_INTRO.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------- bank details card */}
      <section
        id="bank-details"
        aria-label="Donate by bank transfer"
        className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16"
      >
        <Reveal>
          <SectionHeading
            center
            eyebrow="Official details"
            title={BANK_SECTION.title}
            sub={BANK_SECTION.intro}
          />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="card shadow-soft max-w-3xl mx-auto p-5 sm:p-8">
            <dl className="grid sm:grid-cols-2 gap-x-10">
              {BANK_FIELDS.map((field, i) => {
                const wide = "copy" in field && field.label === "Account Number";
                return (
                  <div
                    key={field.label}
                    className={cn(
                      "py-4",
                      i < BANK_FIELDS.length - 1 && "border-b border-sage-100",
                      wide && "sm:col-span-2"
                    )}
                  >
                    <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-forest-600">
                      {field.label}
                    </dt>
                    <dd className="mt-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <span
                        className={cn(
                          "break-words",
                          wide
                            ? "font-display text-lg sm:text-xl font-semibold text-forest-950 tracking-[0.03em] tabular-nums"
                            : "text-[0.975rem] font-medium text-charcoal"
                        )}
                      >
                        {field.display}
                      </span>
                      {"copy" in field && (
                        <CopyButton
                          value={field.copy}
                          ariaLabel={field.ariaLabel}
                          announce={field.announce}
                          fallback={field.fallback}
                        />
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>

            <div className="mt-6 pt-5 border-t border-sage-100 space-y-3">
              <p className="flex items-start gap-2 text-sm text-charcoal-soft">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-leaf-600 shrink-0" aria-hidden />
                <span>{BANK_SECTION.verifyNote}</span>
              </p>
              <p className="flex items-start gap-2 text-sm text-forest-800 bg-forest-50 border border-forest-100 rounded-xl px-3.5 py-3">
                <Info className="w-4 h-4 mt-0.5 text-forest-600 shrink-0" aria-hidden />
                <span>{NO_PAYMENT_NOTICE}</span>
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ steps */}
      <section aria-label="How to donate" className="bg-forest-50/40 border-y border-forest-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <Reveal>
            <SectionHeading
              center
              eyebrow="Step by step"
              title="How to Donate"
              sub="Five calm steps — the transfer itself happens in your own bank."
            />
          </Reveal>
          <ol className="max-w-3xl mx-auto space-y-5">
            {DONATE_STEPS.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={0.05 * i}>
                  <div className="flex gap-4">
                    <span
                      aria-hidden
                      className="w-8 h-8 shrink-0 rounded-full bg-forest-800 text-white text-sm font-semibold flex items-center justify-center mt-0.5"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-charcoal">{step.title}</h3>
                      <p className="text-sm text-charcoal-soft leading-relaxed mt-1">{step.body}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------- after donation */}
      <section aria-label="After you donate" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <Reveal>
          <SectionHeading eyebrow="One last thing" title={AFTER_DONATE.title} center />
        </Reveal>
        <Reveal delay={0.08}>
          <ul className="max-w-2xl mx-auto space-y-3">
            {AFTER_DONATE.points.map((point) => (
              <li key={point.slice(0, 32)} className="flex items-start gap-3 text-charcoal-soft">
                <CheckCircle2 className="w-4.5 h-4.5 text-leaf-600 shrink-0 mt-0.5" aria-hidden />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="flex flex-wrap justify-center gap-3 mt-9">
            <Link href="/contact" className="btn btn-secondary btn-lg">
              Contact the foundation
            </Link>
            <Link href="/journey" className="btn btn-ghost btn-lg">
              Read our journey
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/* --------------------------------------------------------------- leaf motif */

/** Shared decorative leaf trail (same motif as the journey page hero). */
function LeafTrail() {
  const leaves = 10;
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
