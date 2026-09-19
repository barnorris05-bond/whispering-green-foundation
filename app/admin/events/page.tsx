import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Badge, EmptyState } from "@/components/ui";
import { CalendarDays, Plus } from "lucide-react";
import { EventsManager } from "./events-manager";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    include: { _count: { select: { registrations: { where: { status: { not: "cancelled" } } } } } },
    orderBy: { eventDate: "desc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-charcoal">Events</h2>
          <p className="text-sm text-charcoal-soft mt-1">Draft → published → completed/cancelled lifecycle.</p>
        </div>
        <EventsManager
          mode="create"
          trigger={<span className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> New event</span>}
        />
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-5 h-5" />}
          title="No events yet"
          hint="Create your first event — it stays a draft until you publish it."
        />
      ) : (
        <div className="grid gap-3">
          {events.map((e) => (
            <div key={e.id} className="card p-5 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[14rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-charcoal">{e.title}</h3>
                  <Badge tone={e.status === "published" ? "leaf" : e.status === "completed" ? "gray" : e.status === "cancelled" ? "red" : "amber"}>
                    {e.status}
                  </Badge>
                </div>
                <p className="text-xs text-charcoal-soft mt-1">
                  {formatDate(e.eventDate)}{e.startTime ? ` · ${e.startTime}` : ""} · {e.locality} · {e._count.registrations}
                  {e.capacity ? `/${e.capacity}` : ""} registered
                </p>
              </div>
              <EventsManager
                mode="edit"
                trigger={<span className="btn btn-secondary btn-sm">Manage</span>}
                event={{
                  id: e.id,
                  title: e.title,
                  description: e.description,
                  eventDate: e.eventDate.toISOString().slice(0, 10),
                  startTime: e.startTime ?? "",
                  endTime: e.endTime ?? "",
                  locality: e.locality,
                  registrationDeadline: e.registrationDeadline ? e.registrationDeadline.toISOString().slice(0, 10) : "",
                  capacity: e.capacity,
                  status: e.status,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
