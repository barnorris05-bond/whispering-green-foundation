import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, SectionHeading, Badge } from "@/components/ui";
import { absoluteUrl } from "@/lib/site";
import {
  Leaf, HeartHandshake, Target, ShieldCheck, BookOpenCheck, Scale,
  Truck, Megaphone, Users, Compass, ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who we are, what we do, and how Whispering Green Foundation works with the Vasai-West community — including how every published figure is verified.",
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    title: "About · Whispering Green Foundation",
    description:
      "A community initiative coordinating household waste collection and environmental awareness in Vasai-West.",
    url: absoluteUrl("/about"),
    type: "article",
  },
};

/** What the foundation actually does — each card links to the page that shows it. */
const WHAT_WE_DO = [
  {
    icon: Truck,
    title: "Collect household waste",
    text: "Residents request a pickup; coordinators review it, agree a date and record what was collected, by locality and by weight.",
    href: "/request-collection",
    cta: "Request a collection",
  },
  {
    icon: Megaphone,
    title: "Explain responsible disposal",
    text: "Practical guidance on segregation, plastic and recycling, written for Vasai-West households rather than generalised advice.",
    href: "/awareness",
    cta: "Open the awareness portal",
  },
  {
    icon: Users,
    title: "Bring people together",
    text: "Clean-up drives, segregation sessions and awareness walks that residents and volunteers can join in person.",
    href: "/events",
    cta: "See upcoming events",
  },
];

/** Why community participation is the whole point. */
const VALUES = [
  {
    icon: ShieldCheck,
    title: "Verified honesty",
    text: "We publish impact numbers only from weighed, verified collection records — never estimates or intentions.",
  },
  {
    icon: HeartHandshake,
    title: "Community first",
    text: "Residents, volunteers and local groups drive everything we do. Our role is to coordinate, not to claim.",
  },
  {
    icon: Target,
    title: "Practical education",
    text: "Awareness only matters when it changes what goes into which bin. We keep it simple and actionable.",
  },
];

const APPROACH = [
  {
    step: "01",
    title: "Request & review",
    text: "Residents submit a collection request; coordinators check the details and schedule a pickup.",
  },
  {
    step: "02",
    title: "Weigh & record",
    text: "Collected waste is weighed at the pickup point. Date, locality, category and quantity go into a collection record.",
  },
  {
    step: "03",
    title: "Verify, then publish",
    text: "A second pair of eyes re-checks each record against the weighing notes. Only verified records appear in public totals.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
      {/* ------------------------------------------------------------ who we are */}
      <Reveal>
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase bg-white border border-forest-100 text-forest-700 rounded-full px-3.5 py-1.5 shadow-soft">
          <Leaf className="w-3.5 h-3.5 text-leaf-600" /> About the foundation
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-forest-950 tracking-tight mt-5">
          Who we are
        </h1>
        <p className="text-lg text-charcoal-soft leading-relaxed mt-5 max-w-2xl">
          Whispering Green Foundation is a community initiative coordinating household waste collection and
          environmental awareness in Vasai-West, Maharashtra. We help residents get recyclable waste collected
          responsibly and show, with verified records, what a neighbourhood can achieve together.
        </p>
      </Reveal>

      <div className="grid md:grid-cols-2 gap-5 mt-10">
        <Reveal>
          <div className="card p-8 h-full">
            <h2 className="font-display text-2xl font-semibold text-charcoal">Our mission</h2>
            <p className="prose-eco mt-4 text-[0.95rem]">
              To make responsible waste disposal easy and visible for every household in Vasai-West — through
              doorstep collection requests, community events, and honest, verified reporting of what we collect
              together.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="card p-8 h-full">
            <h2 className="font-display text-2xl font-semibold text-charcoal">Our vision</h2>
            <p className="prose-eco mt-4 text-[0.95rem]">
              A Vasai-West where segregated waste is the norm, recyclables never reach the landfill, and every
              neighbourhood can see the real, weighed impact of its own effort.
            </p>
          </div>
        </Reveal>
      </div>

      {/* ------------------------------------------------------------ what we do */}
      <section className="mt-16">
        <Reveal>
          <SectionHeading
            eyebrow="What we do"
            title="Three things, done consistently"
            sub="Collection, explanation and participation — each one backed by a page of this site so you can check the work rather than take our word for it."
          />
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHAT_WE_DO.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.07}>
              <Link href={w.href} className="card card-hover p-7 h-full flex flex-col group">
                <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mb-4">
                  <w.icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-charcoal">{w.title}</h3>
                <p className="text-sm text-charcoal-soft mt-2.5 leading-relaxed flex-1">{w.text}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-forest-700 mt-4 group-hover:gap-2.5 transition-all">
                  {w.cta} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- why community matters */}
      <section className="mt-16">
        <Reveal>
          <SectionHeading
            eyebrow="Why community matters"
            title="One household is a habit. A neighbourhood is a result."
            sub="A single collection changes very little. What makes the numbers move is neighbours taking part at the same time — which is why we organise this work around places and people, not campaigns."
          />
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="card card-hover p-7 h-full">
                <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mb-4">
                  <v.icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-charcoal">{v.title}</h3>
                <p className="text-sm text-charcoal-soft mt-2.5 leading-relaxed">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ our approach */}
      <section className="mt-16">
        <Reveal>
          <SectionHeading
            eyebrow="Our approach"
            title="From logbook to published number"
            sub="Every figure on this site follows the same three-step discipline."
          />
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {APPROACH.map((a, i) => (
            <Reveal key={a.step} delay={i * 0.08}>
              <div className="card card-hover p-7 h-full relative">
                <span className="absolute top-5 right-6 font-display text-3xl font-semibold text-forest-100 select-none">
                  {a.step}
                </span>
                <h3 className="font-display text-lg font-semibold text-charcoal pr-10">{a.title}</h3>
                <p className="text-sm text-charcoal-soft mt-2.5 leading-relaxed">{a.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- journey CTA band */}
      <Reveal>
        <div className="card overflow-hidden mt-16">
          <div className="grid lg:grid-cols-[1.15fr_1fr]">
            <div className="p-8 sm:p-10">
              <Badge tone="leaf">
                <Compass className="w-3 h-3" /> Foundation Journey
              </Badge>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal tracking-tight mt-4">
                There is more to the story than this page
              </h2>
              <p className="text-charcoal-soft leading-relaxed mt-3.5 text-[0.95rem]">
                The About page explains what we do. The Journey page follows <em>when</em> and <em>how</em> it
                happened — the early work, the field logbook, and the founder&apos;s own account of how it started.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <Link href="/journey" className="btn btn-primary">
                  Read the Foundation Journey <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/initiatives" className="btn btn-ghost">See the projects</Link>
              </div>
            </div>
            <div className="relative bg-forest-900 text-forest-50 p-8 sm:p-10 flex flex-col justify-center">
              <p className="font-display text-xl leading-snug">
                “We would rather leave a section blank than publish a story we cannot verify.”
              </p>
              <p className="text-xs text-forest-300/80 mt-4">
                How this site treats incomplete records — and why one logbook total is deliberately left unverified.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ------------------------------------------------ CEP Phase II provenance */}
      <Reveal>
        <div className="card p-8 mt-14 border-clay bg-parchment/60">
          <Badge tone="leaf" className="mb-4">
            <BookOpenCheck className="w-3 h-3" /> CEP Phase II · Eco Engineering (Group 2)
          </Badge>
          <h2 className="font-display text-2xl font-semibold text-charcoal">Where our numbers come from</h2>
          <div className="prose-eco mt-3 text-[0.95rem]">
            <p>
              This platform hosts the community engagement project work of a student team (Eco Engineering, Group 2)
              in Vasai-West during August–September 2026. Their field logbook records door-to-door dry waste
              collection drives — dates, localities and weighed quantities — which are entered into this system as
              collection records.
            </p>
            <p className="mt-3 flex gap-2.5">
              <Scale className="w-4.5 h-4.5 text-bark shrink-0 mt-1" />
              <span>
                <strong>On uncertainty:</strong> one stated weekly total in the source logbook does not match the sum
                of its individual entries. Those records are imported but deliberately left{" "}
                <em>unverified</em> — they are excluded from public totals until the source entries are re-checked.
                Transparency about uncertainty beats a confident wrong number.
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/awareness/the-logbook-behind-our-numbers" className="btn btn-secondary btn-sm">
              <BookOpenCheck className="w-4 h-4" /> Read: the logbook behind our numbers
            </Link>
            <Link href="/initiatives" className="btn btn-ghost btn-sm">
              See the projects
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ------------------------------------------------------------- final CTA */}
      <Reveal>
        <div className="card p-8 mt-14 text-center bg-forest-900 text-forest-50 border-forest-900">
          <Leaf className="w-8 h-8 text-leaf-300 mx-auto" />
          <h2 className="font-display text-2xl font-semibold mt-4">Ready to take part?</h2>
          <p className="text-forest-100/85 text-sm mt-2 max-w-lg mx-auto">
            Book a collection for your household, or join the next community drive — every verified kilogram counts.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href="/request-collection" className="btn btn-leaf">Request a collection</Link>
            <Link href="/events" className="btn btn-ghost text-forest-50 hover:bg-white/10">Join an event</Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
