import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Badge, Breadcrumbs } from "@/components/ui";
import { EventRegisterForm } from "./register-form";
import { CalendarDays, MapPin, Clock, Users, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || event.status === "draft") return { title: "Event" };
  return { title: event.title, description: event.description.slice(0, 150) };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { _count: { select: { registrations: { where: { status: { not: "cancelled" } } } } } },
  });

  if (!event || event.status === "draft" || event.status === "cancelled") notFound();

  const now = new Date();
  const isPast = event.eventDate < now;
  const regOpen =
    event.status === "published" &&
    !isPast &&
    (!event.registrationDeadline || event.registrationDeadline >= now) &&
    (event.capacity == null || event._count.registrations < event.capacity);

  const closedReason = !regOpen
    ? event.status === "completed"
      ? "This event is completed."
      : isPast
        ? "This event has already taken place."
        : event.registrationDeadline && event.registrationDeadline < now
          ? "Registration deadline has passed."
          : event.capacity != null && event._count.registrations >= event.capacity
            ? "Event is at full capacity."
            : "Registration is not open."
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-10">
      <Breadcrumbs items={[{ href: "/events", label: "Events" }, { label: event.title }]} />

      <div className="mt-6 grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={isPast ? "gray" : "leaf"}>{isPast ? "Past event" : "Upcoming"}</Badge>
            {event.capacity != null && (
              <Badge tone="green"><Users className="w-3 h-3" /> {event._count.registrations}/{event.capacity} registered</Badge>
            )}
          </div>
          <h1 className="font-display text-4xl font-semibold text-forest-950 tracking-tight mt-4">{event.title}</h1>
          <p className="prose-eco mt-5 whitespace-pre-line">{event.description}</p>

          {isPast && (
            <div className="card p-6 mt-8 bg-parchment/60 border-clay">
              <h2 className="font-semibold text-charcoal flex items-center gap-2"><Info className="w-4.5 h-4.5 text-bark" /> Participation notes</h2>
              <p className="text-sm text-charcoal-soft mt-2">
                This event has concluded. Records from this event, once verified by staff, contribute to the public
                impact figures.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="card p-7">
            <h2 className="font-display text-lg font-semibold text-charcoal mb-4">Event details</h2>
            <dl className="space-y-3.5 text-sm">
              <div className="flex gap-3">
                <CalendarDays className="w-4.5 h-4.5 text-forest-600 shrink-0 mt-0.5" />
                <div><dt className="text-xs text-charcoal-soft/70">Date</dt><dd className="font-medium">{formatDate(event.eventDate)}</dd></div>
              </div>
              {event.startTime && (
                <div className="flex gap-3">
                  <Clock className="w-4.5 h-4.5 text-forest-600 shrink-0 mt-0.5" />
                  <div><dt className="text-xs text-charcoal-soft/70">Time</dt><dd className="font-medium">{event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}</dd></div>
                </div>
              )}
              <div className="flex gap-3">
                <MapPin className="w-4.5 h-4.5 text-forest-600 shrink-0 mt-0.5" />
                <div><dt className="text-xs text-charcoal-soft/70">Locality</dt><dd className="font-medium">{event.locality}</dd></div>
              </div>
              {event.registrationDeadline && !isPast && (
                <div className="flex gap-3">
                  <Info className="w-4.5 h-4.5 text-forest-600 shrink-0 mt-0.5" />
                  <div><dt className="text-xs text-charcoal-soft/70">Register by</dt><dd className="font-medium">{formatDate(event.registrationDeadline)}</dd></div>
                </div>
              )}
            </dl>
          </div>

          <div className="card p-7">
            <h2 className="font-display text-lg font-semibold text-charcoal mb-1.5">Volunteer registration</h2>
            {regOpen ? (
              <>
                <p className="text-xs text-charcoal-soft/80 mb-4">
                  One registration per person per event. You&apos;ll see a confirmation on screen.
                </p>
                <EventRegisterForm eventId={event.id} />
              </>
            ) : (
              <p className="text-sm text-charcoal-soft bg-sage-50 border border-sage-200 rounded-xl px-4 py-3.5">
                {closedReason}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
