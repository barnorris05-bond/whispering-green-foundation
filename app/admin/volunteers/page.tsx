import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Badge, EmptyState, STATUS_TONES } from "@/components/ui";
import { Users } from "lucide-react";
import { AttendanceControls } from "./attendance-controls";

export const dynamic = "force-dynamic";

export default async function AdminVolunteersPage() {
  const events = await prisma.event.findMany({
    include: {
      registrations: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { eventDate: "desc" },
  });

  const withRegs = events.filter((e) => e.registrations.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-charcoal">Volunteer registrations</h2>
        <p className="text-sm text-charcoal-soft mt-1">Manage sign-ups per event, mark attendance, export CSV.</p>
      </div>

      {withRegs.length === 0 ? (
        <EmptyState
          icon={<Users className="w-5 h-5" />}
          title="No volunteer registrations yet"
          hint="Registrations appear here as residents sign up on event pages."
        />
      ) : (
        withRegs.map((e) => (
          <section key={e.id} className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-sage-200 bg-sage-50/60">
              <div>
                <h3 className="font-semibold text-charcoal">{e.title}</h3>
                <p className="text-xs text-charcoal-soft mt-0.5">{formatDate(e.eventDate)} · {e.locality}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone="green">{e.registrations.length} registered</Badge>
                <a href={`/api/admin/export/registrations?eventId=${e.id}`} className="btn btn-secondary btn-sm">Export CSV</a>
              </div>
            </div>
            <div className="scroll-x">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-charcoal-soft/70 border-b border-sage-200">
                    <th className="px-5 py-2.5 font-medium">Name</th>
                    <th className="px-5 py-2.5 font-medium">Contact</th>
                    <th className="px-5 py-2.5 font-medium">Registered</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5 font-medium">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                  {e.registrations.map((r) => (
                    <tr key={r.id}>
                      <td className="px-5 py-3 font-medium text-charcoal">{r.name}</td>
                      <td className="px-5 py-3 text-charcoal-soft">{r.email}{r.phone ? ` · ${r.phone}` : ""}</td>
                      <td className="px-5 py-3 text-charcoal-soft whitespace-nowrap">{formatDate(r.createdAt)}</td>
                      <td className="px-5 py-3"><Badge tone={STATUS_TONES[r.status] ?? "gray"}>{r.status}</Badge></td>
                      <td className="px-5 py-3"><AttendanceControls id={r.id} attendance={r.attendance ?? ""} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
