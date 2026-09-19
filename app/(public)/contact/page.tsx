import type { Metadata } from "next";
import { Reveal, SectionHeading, Badge } from "@/components/ui";
import { ContactForm } from "./contact-form";
import { Mail, MessageSquare, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a message to Whispering Green Foundation — we read every message.",
};

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
      <Reveal>
        <SectionHeading
          eyebrow="Talk to us"
          title="Contact the foundation"
          sub="Questions about collections, events or partnerships for the demo — send us a message and staff will see it in the admin dashboard."
        />
      </Reveal>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
        <Reveal>
          <div className="card p-8">
            <h2 className="font-display text-xl font-semibold text-charcoal flex items-center gap-2 mb-5">
              <MessageSquare className="w-5 h-5 text-forest-600" /> Send a message
            </h2>
            <ContactForm />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card p-8">
            <h2 className="font-display text-xl font-semibold text-charcoal mb-4">Reach us</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4.5 h-4.5 text-forest-600 mt-0.5" />
                <div>
                  <p className="font-medium text-charcoal">Email</p>
                  <p className="text-charcoal-soft">Set via Admin → Settings (placeholder)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4.5 h-4.5 text-forest-600 mt-0.5" />
                <div>
                  <p className="font-medium text-charcoal">Area</p>
                  <p className="text-charcoal-soft">Vasai-West, Palghar, Maharashtra</p>
                </div>
              </li>
            </ul>
            <div className="mt-6">
              <Badge tone="demo">Demo build — no real inbox is monitored</Badge>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
