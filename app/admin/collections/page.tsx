import { prisma } from "@/lib/db";
import { formatDate, formatIN, toDateInput } from "@/lib/format";
import { CATEGORY_LABELS, WASTE_CATEGORIES } from "@/lib/domain";
import { Badge, STATUS_TONES, EmptyState } from "@/components/ui";
import { Recycle, Plus } from "lucide-react";
import { RecordsManager } from "./records-manager";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; requestId?: string }>;
}) {
  const sp = await searchParams;
  // When arriving from a completed request, prefill the new-record form with that request.
  const prefillRequest = sp.requestId
    ? await prisma.collectionRequest.findUnique({
        where: { id: sp.requestId },
        select: { id: true, referenceCode: true },
      })
    : null;

  const where = {
    AND: [sp.status ? { verificationStatus: sp.status } : {}, sp.category ? { category: sp.category } : {}],
  };

  const [records, requests, events, projects] = await Promise.all([
    prisma.collectionRecord.findMany({ where, orderBy: { collectionDate: "desc" }, include: { recordedBy: { select: { name: true } } } }),
    prisma.collectionRequest.findMany({
      where: { status: { in: ["approved", "scheduled", "in_progress", "completed"] } },
      select: { id: true, referenceCode: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }).then((rows) => rows.map((r) => ({ id: r.id, title: r.referenceCode }))),
    prisma.event.findMany({ select: { id: true, title: true }, orderBy: { eventDate: "desc" }, take: 50 }),
    prisma.project.findMany({ select: { id: true, title: true }, orderBy: { updatedAt: "desc" }, take: 50 }),
  ]);

  const verifiedKg = records.filter((r) => r.verificationStatus === "verified" && r.unit === "kg").reduce((s, r) => s + r.quantity, 0);
  const draftCount = records.filter((r) => r.verificationStatus === "draft").length;

  return (
    <div className="space-y-6">
      <section className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs text-charcoal-soft/80">Verified total (kg records only)</p>
          <p className="font-display text-3xl font-semibold text-forest-800 mt-1">{formatIN(verifiedKg)} kg</p>
          <p className="text-[0.68rem] text-charcoal-soft/70 mt-1">Shown publicly · excludes drafts & non-kg units</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-charcoal-soft/80">Draft records</p>
          <p className="font-display text-3xl font-semibold text-charcoal mt-1">{draftCount}</p>
          <p className="text-[0.68rem] text-charcoal-soft/70 mt-1">Not counted anywhere publicly until verified</p>
        </div>
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs text-charcoal-soft/80">Total records</p>
            <p className="font-display text-3xl font-semibold text-charcoal mt-1">{records.length}</p>
          </div>
          <RecordsManager
            trigger={
              <span className="btn btn-primary btn-sm w-full mt-3">
                <Plus className="w-4 h-4" /> Add record
              </span>
            }
            mode="create"
            requests={requests}
            events={events}
            projects={projects}
            prefillRequestId={prefillRequest?.id}
          />
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <h2 className="font-display text-xl font-semibold text-charcoal flex items-center gap-2">
            <Recycle className="w-5 h-5 text-forest-600" /> Collection records
          </h2>
          <form className="flex gap-2" role="search">
            <select name="status" defaultValue={sp.status ?? ""} className="input btn-sm" aria-label="Verification status">
              <option value="">All verification</option>
              <option value="draft">Draft</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <select name="category" defaultValue={sp.category ?? ""} className="input btn-sm" aria-label="Category">
              <option value="">All categories</option>
              {WASTE_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
            <button className="btn btn-secondary btn-sm">Filter</button>
          </form>
        </div>

        {records.length === 0 ? (
          <EmptyState
            icon={<Recycle className="w-5 h-5" />}
            title="No collection records yet"
            hint="Record actual collections here with quantity and unit. Only verified records appear publicly."
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="scroll-x">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-charcoal-soft/70 border-b border-sage-200 bg-sage-50/60">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Locality</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Quantity</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Verification</th>
                    <th className="px-4 py-3 font-medium">Recorded by</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-forest-50/40 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-charcoal-soft">{formatDate(r.collectionDate)}</td>
                      <td className="px-4 py-3 text-charcoal-soft">{r.locality}</td>
                      <td className="px-4 py-3 text-charcoal-soft">{CATEGORY_LABELS[r.category] ?? r.category}</td>
                      <td className="px-4 py-3 font-semibold text-forest-800 whitespace-nowrap">{formatIN(r.quantity)} {r.unit}</td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_TONES[r.measurementType] ?? "gray"}>{r.measurementType}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={r.verificationStatus === "verified" ? "leaf" : r.verificationStatus === "draft" ? "amber" : "red"}>
                          {r.verificationStatus}
                        </Badge>
                        {r.isLogbookSeed && <Badge tone="demo" className="ml-1">logbook</Badge>}
                      </td>
                      <td className="px-4 py-3 text-charcoal-soft">{r.recordedBy?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <RecordsManager
                          trigger={<span className="btn btn-ghost btn-sm">Edit</span>}
                          mode="edit"
                          record={{
                            id: r.id,
                            collectionDate: toDateInput(r.collectionDate),
                            locality: r.locality,
                            category: r.category,
                            quantity: r.quantity,
                            unit: r.unit,
                            measurementType: r.measurementType,
                            verificationStatus: r.verificationStatus,
                            notes: r.notes ?? "",
                            eventId: r.eventId ?? "",
                            projectId: r.projectId ?? "",
                            requestId: r.requestId ?? "",
                          }}
                          requests={requests}
                          events={events}
                          projects={projects}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
