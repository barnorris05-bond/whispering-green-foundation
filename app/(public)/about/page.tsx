import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, SectionHeading, Badge } from "@/components/ui";
import { Leaf, HeartHandshake, Target, ShieldCheck, BookOpenCheck, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who we are, what we do, and how Whispering Green Foundation works with the Vasai-West community.",
};

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
      <Reveal>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-forest-950 tracking-tight">
          About Whispering Green Foundation
        </h1>
        <p className="text-lg text-charcoal-soft leading-relaxed mt-5 max-w-2xl">
          Whispering Green Foundation is a community initiative coordinating household waste collection and
          environmental awareness in Vasai-West, Maharashtra. We help residents get recyclable waste collected
          responsibly and show, with verified records, what a neighbourhood can achieve together.
        </p>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-5 mt-14">
        {VALUES.map((v, i) => (
          <Reveal key={v.title} delay={i * 0.08}>
            <div className="card card-hover p-7 h-full">
              <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mb-4">
                <v.icon className="w-5.5 h-5.5" />
              </div>
              <h2 className="font-display text-xl font-semibold text-charcoal">{v.title}</h2>
              <p className="text-sm text-charcoal-soft mt-2.5 leading-relaxed">{v.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-14">
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

      {/* Our approach — transparency about method instead of a bare "note" */}
      <section className="mt-16">
        <Reveal>
          <SectionHeading
            eyebrow="How we work"
            title="From logbook to published number"
            sub="Every figure on this site follows the same three-step discipline."
          />
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
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

      {/* CEP Phase II context — source-grounded, no invented facts */}
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
