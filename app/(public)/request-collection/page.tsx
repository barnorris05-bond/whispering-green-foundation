import type { Metadata } from "next";
import { Reveal, SectionHeading } from "@/components/ui";
import { RequestForm } from "./request-form";
import { ClipboardList, Truck, ShieldCheck, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Request a Collection",
  description: "Request a household waste collection in Vasai-West — plastic, dry recyclables and more.",
};

export default function RequestCollectionPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
      <Reveal>
        <SectionHeading
          eyebrow="Resident portal"
          title="Request a waste collection"
          sub="Fill this short form and our team will review your request. You'll receive a reference code to track it."
        />
      </Reveal>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
        <Reveal>
          <div className="card p-7 sm:p-9">
            <RequestForm />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-5 lg:sticky lg:top-24">
            <div className="card p-7">
              <h2 className="font-display text-lg font-semibold text-charcoal mb-4">What happens next?</h2>
              <ol className="space-y-4">
                {[
                  { icon: ClipboardList, t: "Review", d: "Our team checks every request within a few days." },
                  { icon: Truck, t: "Scheduling", d: "Approved requests get a pickup slot and you can track progress." },
                  { icon: ShieldCheck, t: "Verified impact", d: "Collected waste is weighed and recorded — only verified records appear publicly." },
                ].map((s, i) => (
                  <li key={s.t} className="flex gap-3.5">
                    <span className="w-9 h-9 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shrink-0">
                      <s.icon className="w-4.5 h-4.5" />
                    </span>
                    <div>
                      <p className="font-medium text-charcoal text-sm">{i + 1}. {s.t}</p>
                      <p className="text-xs text-charcoal-soft mt-0.5 leading-relaxed">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card p-7 bg-parchment/70 border-clay">
              <h2 className="font-semibold text-charcoal flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-bark" /> Privacy & consent
              </h2>
              <p className="text-xs text-charcoal-soft/85 mt-2 leading-relaxed">
                Your address and contact details are private — staff can see them only to arrange the pickup, and
                they never appear on public pages. The reference code alone can&apos;t reveal your details.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
