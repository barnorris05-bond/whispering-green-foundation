import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Reveal, SectionHeading, Badge, EmptyState } from "@/components/ui";
import { CalendarDays, MapPin, Clock, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description: "Clean-up drives, awareness sessions and community events by Whispering Green Foundation.",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const show = filter === "past" ? "past" : "upcoming";
  const now = new Date();

  const events = await prisma.event.findMany({
    where: show === "upcoming"
      ? { status: "published", eventDate: { gte: now } }
      : { status: { in: ["completed", "published"] }, eventDate: { lt: now } },
    orderBy: show === "upcoming" ? { eventDate: "asc" } : { eventDate: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
      <Reveal>
        <SectionHeading
          eyebrow="Get involved"
          title="Community events"
          sub="Clean-up drives, segregation workshops and awareness walks across Vasai-West."
        />
      </Reveal>

      <div className="flex gap-2 mb-8" role="tablist" aria-label="Event time filter">
        {[
          ["upcoming", "Upcoming"],
          ["past", "Past"],
        ].map(([key, label]) => (
          <Link
            key={key}
            href={show === key ? "/events" : `/events?filter=${key}`}
            role="tab"
            aria-selected={show === key}
            className={show === key ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
          >
            {label}
          </Link>
        ))}
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-5 h-5" />}
          title={show === "upcoming" ? "No upcoming events right now" : "No past events"}
          hint="New events are announced here — check back soon."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((e, i) => {
            const isPast = e.eventDate < now;
            return (
              <Reveal key={e.id} delay={i * 0.06}>
                <Link href={`/events/${e.slug}`} className="card card-hover block p-6 h-full group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-forest-700 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" /> {formatDate(e.eventDate)}
                    </span>
                    <Badge tone={e.status === "completed" ? "gray" : isPast ? "gray" : "leaf"}>
                      {e.status === "completed" ? "Completed" : isPast ? "Past" : "Open"}
                    </Badge>
                  </div>
                  <h2 className="font-display text-lg font-semibold text-charcoal mt-3 group-hover:text-forest-700 transition-colors">
                    {e.title}
                  </h2>
                  <p className="text-sm text-charcoal-soft mt-2 line-clamp-2">{e.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-soft/75 mt-4">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {e.locality}</span>
                    {e.startTime && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {e.startTime}{e.endTime ? `–${e.endTime}` : ""}</span>}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
