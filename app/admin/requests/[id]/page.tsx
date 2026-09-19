import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/format";
import { CATEGORY_LABELS, REQUEST_STATUSES, STATUS_LABELS, STATUS_TRANSITIONS } from "@/lib/domain";
import { Badge, STATUS_TONES, Breadcrumbs } from "@/components/ui";
import { RequestStatusPanel } from "./status-panel";
import { ShieldCheck, MapPin, CalendarDays, Lock, ImageIcon, History, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await prisma.collectionRequest.findUnique({
    where: { id },
    include: {
      history: { orderBy: { createdAt: "asc" }, include: { actor: { select: { name: true } } } },
      event: { select: { title: true, slug: true } },
      records: true,
    },
  });
  if (!request) notFound();

  const events = await prisma.event.findMany({
    where: { status: "published", eventDate: { gte: new Date() } },
    select: { id: true, title: true, eventDate: true },
    orderBy: { eventDate: "asc" },
  });

  const nextStatuses = STATUS_TRANSITIONS[request.status] ?? [];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ href: "/admin/requests", label: "Requests" }, { label: request.referenceCode }]} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-semibold text-charcoal font-mono tracking-[0.08em]">
              {request.referenceCode}
            </h2>
            <Badge tone={STATUS_TONES[request.status]}>{STATUS_LABELS[request.status]}</Badge>
          </div>
          <p className="text-sm text-charcoal-soft mt-1.5">
            Submitted {formatDateTime(request.createdAt)} · {CATEGORY_LABELS[request.category] ?? request.category}
          </p>
        </div>
        {request.photoPath && (
          <a href={`/api/media/file/${request.photoPath}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
            <ImageIcon className="w-4 h-4" /> View resident photo
          </a>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-charcoal mb-4">Request details</h3>
            <dl className="space-y-3.5 text-sm">
              <Row label="Resident" value={request.name} />
              <Row label="Email" value={request.email ?? "—"} />
              <Row label="Phone" value={request.phone ?? "—"} />
              <Row label="Quantity (resident estimate)" value={request.quantity ? `${request.quantity} ${request.unit}` : "—"} />
              <Row label="Locality" value={request.locality} icon={<MapPin className="w-4 h-4" />} />
              <Row
                label="Preferred date"
                value={request.preferredDate ? formatDate(request.preferredDate) : "—"}
                icon={<CalendarDays className="w-4 h-4" />}
              />
              <Row
                label="Scheduled date"
                value={request.scheduledDate ? formatDate(request.scheduledDate) : "not scheduled"}
                icon={<CalendarDays className="w-4 h-4" />}
              />
              {request.event && <Row label="Linked event" value={request.event.title} />}
              <Row label="Description" value={request.description} wide />
              <Row
                label={<span className="inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-bark" /> Address (private)</span>}
                value={request.address ?? "— not provided —"}
                wide
                mono
              />
            </dl>
            <p className="text-[0.68rem] text-charcoal-soft/70 mt-4 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Name, contact and address never appear on public pages or APIs.
            </p>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-charcoal mb-5 flex items-center gap-2">
              <History className="w-4.5 h-4.5 text-forest-600" /> Status history
            </h3>
            <ol className="relative border-l-2 border-forest-100 ml-2 space-y-5">
              {request.history.map((h) => (
                <li key={h.id} className="pl-6 relative">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-forest-400 border-2 border-white shadow-soft" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={STATUS_TONES[h.newStatus] ?? "gray"}>{STATUS_LABELS[h.newStatus] ?? h.newStatus}</Badge>
                    {h.oldStatus && h.oldStatus !== h.newStatus && (
                      <span className="text-xs text-charcoal-soft/60">
                        from {STATUS_LABELS[h.oldStatus] ?? h.oldStatus}
                      </span>
                    )}
                  </div>
                  {h.note && <p className="text-sm text-charcoal-soft mt-1.5 leading-relaxed">{h.note}</p>}
                  <p className="text-xs text-charcoal-soft/60 mt-1">
                    {formatDateTime(h.createdAt)}{h.actor ? ` · by ${h.actor.name}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <RequestStatusPanel
            requestId={request.id}
            currentStatus={request.status}
            nextStatuses={nextStatuses}
            scheduledDate={request.scheduledDate ? request.scheduledDate.toISOString().slice(0, 10) : ""}
            assignedEventId={request.assignedEventId ?? ""}
            events={events.map((e) => ({ id: e.id, title: e.title, date: formatDate(e.eventDate) }))}
          />

          {request.status === "completed" && request.records.length === 0 && (
            <div className="card p-6 border-leaf-200 bg-leaf-100/40">
              <h3 className="font-semibold text-charcoal text-sm">Outcome not yet recorded</h3>
              <p className="text-xs text-charcoal-soft mt-1.5 leading-relaxed">
                This request is completed but no collection record exists yet. Add one from Collection records with the
                verified quantity — it will count towards public impact only after verification.
              </p>
              <Link href="/admin/collections?requestId=" className="btn btn-primary btn-sm mt-3">
                Go to collection records <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, icon, wide, mono }: { label: React.ReactNode; value: React.ReactNode; icon?: React.ReactNode; wide?: boolean; mono?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="text-xs text-charcoal-soft/70 flex items-center gap-1.5">{icon}{label}</dt>
      <dd className={`font-medium text-charcoal mt-0.5 ${mono ? "font-mono text-xs bg-sage-50 border border-sage-200 rounded-lg px-2.5 py-1.5 inline-block" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
