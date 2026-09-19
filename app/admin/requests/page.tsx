import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { REQUEST_STATUSES, STATUS_LABELS, CATEGORY_LABELS, WASTE_CATEGORIES } from "@/lib/domain";
import { Badge, STATUS_TONES, EmptyState } from "@/components/ui";
import { ClipboardList, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; ref?: string; page?: string; locality?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const perPage = 12;

  const where = {
    AND: [
      sp.status ? { status: sp.status } : {},
      sp.category ? { category: sp.category } : {},
      sp.locality ? { locality: { contains: sp.locality } } : {},
      sp.ref ? { referenceCode: { contains: sp.ref.toUpperCase().trim() } } : {},
    ],
  };

  const [total, requests] = await Promise.all([
    prisma.collectionRequest.count({ where }),
    prisma.collectionRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-5">
      <form className="card p-4 flex flex-wrap gap-3 items-end" role="search">
        <div className="flex-1 min-w-[13rem]">
          <label htmlFor="f-ref" className="label text-xs">Reference code</label>
          <input id="f-ref" name="ref" defaultValue={sp.ref} placeholder="WGF-…" className="input font-mono" />
        </div>
        <div>
          <label htmlFor="f-status" className="label text-xs">Status</label>
          <select id="f-status" name="status" defaultValue={sp.status ?? ""} className="input">
            <option value="">All statuses</option>
            {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-cat" className="label text-xs">Category</label>
          <select id="f-cat" name="category" defaultValue={sp.category ?? ""} className="input">
            <option value="">All categories</option>
            {WASTE_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-loc" className="label text-xs">Locality</label>
          <input id="f-loc" name="locality" defaultValue={sp.locality} placeholder="e.g. Bhabola" className="input" />
        </div>
        <button className="btn btn-primary btn-sm">Filter</button>
        <Link href="/admin/requests" className="btn btn-ghost btn-sm">Clear</Link>
      </form>

      {requests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-5 h-5" />}
          title="No requests match these filters"
          hint="Try clearing filters — new resident requests will land here."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="scroll-x">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-charcoal-soft/70 border-b border-sage-200 bg-sage-50/60">
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Resident</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Locality</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-forest-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/requests/${r.id}`} className="font-mono text-xs font-semibold text-forest-800 hover:underline">
                        {r.referenceCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-charcoal-soft">{r.name}</td>
                    <td className="px-4 py-3 text-charcoal-soft">{CATEGORY_LABELS[r.category] ?? r.category}</td>
                    <td className="px-4 py-3 text-charcoal-soft">{r.locality}</td>
                    <td className="px-4 py-3 text-charcoal-soft whitespace-nowrap">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3"><Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-sage-200 text-xs text-charcoal-soft">
            <span>{total} request{total === 1 ? "" : "s"} · page {page} of {pages}</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={{ query: { ...sp, page: page - 1 } } as never} className="btn btn-secondary btn-sm">Previous</Link>
              )}
              {page < pages && (
                <Link href={{ query: { ...sp, page: page + 1 } } as never} className="btn btn-secondary btn-sm">Next</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
