import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatIN, formatDateTime, timeAgo } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/domain";
import { Badge, STATUS_TONES } from "@/components/ui";
import {
  ClipboardList, CalendarClock, CheckCircle2, CalendarDays, Users, ArrowRight, Activity,
} from "lucide-react";
import { ImpactChart } from "./impact-chart";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();

  const [
    pendingCount,
    scheduledCount,
    completedCount,
    publishedEvents,
    volunteerCount,
    pendingRequests,
    recentHistory,
    verified,
  ] = await Promise.all([
    prisma.collectionRequest.count({ where: { status: { in: ["submitted", "under_review"] } } }),
    prisma.collectionRequest.count({ where: { status: { in: ["approved", "scheduled", "in_progress"] } } }),
    prisma.collectionRequest.count({ where: { status: "completed" } }),
    prisma.event.count({ where: { status: "published" } }),
    prisma.volunteerRegistration.count(),
    prisma.collectionRequest.findMany({
      where: { status: { in: ["submitted", "under_review"] } },
      orderBy: { createdAt: "asc" },
      take: 6,
      select: { id: true, referenceCode: true, name: true, category: true, locality: true, createdAt: true, status: true },
    }),
    prisma.requestStatusHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { request: { select: { referenceCode: true } }, actor: { select: { name: true } } },
    }),
    prisma.collectionRecord.findMany({
      where: { verificationStatus: "verified" },
      orderBy: { collectionDate: "asc" },
      select: { collectionDate: true, quantity: true, unit: true, category: true, measurementType: true },
    }),
  ]);

  const totalVerifiedKg = verified.filter((r) => r.unit === "kg").reduce((s, r) => s + r.quantity, 0);
  const hasChartData = verified.length > 0;

  const cards = [
    { label: "Pending requests", value: pendingCount, icon: ClipboardList, href: "/admin/requests", tone: "text-amber-600" },
    { label: "Scheduled / in progress", value: scheduledCount, icon: CalendarClock, href: "/admin/requests", tone: "text-sky-600" },
    { label: "Completed requests", value: completedCount, icon: CheckCircle2, href: "/admin/requests", tone: "text-leaf-600" },
    { label: "Published events", value: publishedEvents, icon: CalendarDays, href: "/admin/events", tone: "text-forest-600" },
    { label: "Volunteer sign-ups", value: volunteerCount, icon: Users, href: "/admin/volunteers", tone: "text-forest-600" },
  ];

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-charcoal">Overview</h2>
            <p className="text-sm text-charcoal-soft mt-1">
              Live figures from the local database · verified waste collected: <strong>{formatIN(totalVerifiedKg)} kg</strong>
            </p>
          </div>
          <Link href="/admin/collections" className="btn btn-secondary btn-sm">
            Manage collection records <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="card card-hover p-5 group">
              <c.icon className={`w-5 h-5 ${c.tone}`} />
              <p className="font-display text-3xl font-semibold text-charcoal mt-3">{c.value}</p>
              <p className="text-xs text-charcoal-soft/85 mt-1">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display text-lg font-semibold text-charcoal mb-1">Verified collections trend</h3>
          <p className="text-xs text-charcoal-soft/80 mb-4">
            Verified records only (kg). Draft/unverified records and raw requests are excluded.
          </p>
          {hasChartData ? (
            <ImpactChart
              data={verified
                .filter((r) => r.unit === "kg")
                .map((r) => ({
                  date: r.collectionDate.toISOString().slice(0, 10),
                  quantity: r.quantity,
                  estimated: r.measurementType === "estimated",
                }))}
            />
          ) : (
            <p className="text-sm text-charcoal-soft bg-sage-50 border border-sage-200 rounded-xl px-4 py-6 text-center">
              No verified records yet — add and verify collection records to see the trend.
            </p>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-charcoal">Needs review</h3>
            <Link href="/admin/requests" className="text-xs font-medium text-forest-700 hover:underline">View all</Link>
          </div>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-charcoal-soft bg-sage-50 border border-sage-200 rounded-xl px-4 py-6 text-center">
              🎉 Nothing waiting — the request queue is clear.
            </p>
          ) : (
            <ul className="divide-y divide-sage-200">
              {pendingRequests.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/requests?ref=${r.referenceCode}`} className="flex items-center gap-3 py-3 group">
                    <span className="font-mono text-xs bg-forest-50 border border-forest-100 rounded-md px-1.5 py-0.5 text-forest-800">
                      {r.referenceCode}
                    </span>
                    <span className="text-sm text-charcoal-soft truncate flex-1">
                      {r.name} · {r.locality}
                    </span>
                    <Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                    <ArrowRight className="w-4 h-4 text-charcoal-soft/40 group-hover:text-forest-700 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="card p-6">
        <h3 className="font-display text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-forest-600" /> Recent activity
        </h3>
        {recentHistory.length === 0 ? (
          <p className="text-sm text-charcoal-soft">No activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {recentHistory.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-charcoal-soft/60 w-20 shrink-0">{timeAgo(h.createdAt)}</span>
                <Badge tone={STATUS_TONES[h.newStatus] ?? "gray"}>{STATUS_LABELS[h.newStatus] ?? h.newStatus}</Badge>
                <span className="text-charcoal-soft">
                  request <span className="font-mono text-xs text-forest-800">{h.request.referenceCode}</span>
                  {h.actor && <> by {h.actor.name}</>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
