import type { Metadata } from "next";
import { Reveal, SectionHeading } from "@/components/ui";
import { TrackClient } from "./track-client";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Track a Request",
  description: "Track your waste collection request using your reference code and contact details.",
};

export default async function TrackRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 pb-10">
      <Reveal>
        <SectionHeading
          eyebrow="Resident portal"
          title="Track your request"
          sub="Enter your reference code and the email or phone you submitted with. For privacy, both must match."
        />
      </Reveal>
      <TrackClient initialCode={code} />
    </div>
  );
}
