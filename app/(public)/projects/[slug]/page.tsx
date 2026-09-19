import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CATEGORY_LABELS } from "@/lib/domain";
import { formatDate, formatIN } from "@/lib/format";
import { Badge, EmptyState, Breadcrumbs } from "@/components/ui";
import { MapPin, CalendarRange, ShieldCheck, ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project || project.visibility !== "published") return { title: "Project" };
  return { title: project.title, description: project.description.slice(0, 150) };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      records: { where: { verificationStatus: "verified" }, orderBy: { collectionDate: "desc" } },
      media: { where: { visibility: "approved" } },
    },
  });

  if (!project || project.visibility !== "published") notFound();

  const totalKg = project.records.reduce((s, r) => (r.unit === "kg" ? s + r.quantity : s), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-10">
      <Breadcrumbs items={[{ href: "/initiatives", label: "Initiatives" }, { label: project.title }]} />

      <div className="mt-6">
        <div className="flex flex-wrap gap-2">
          <Badge tone="green">{CATEGORY_LABELS[project.category] ?? project.category}</Badge>
          <Badge tone={project.status === "active" ? "leaf" : "gray"}>{project.status}</Badge>
        </div>
        <h1 className="font-display text-4xl font-semibold text-forest-950 tracking-tight mt-4">{project.title}</h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-charcoal-soft mt-4">
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-forest-600" /> {project.locality}</span>
          {project.startDate && (
            <span className="flex items-center gap-1.5">
              <CalendarRange className="w-4 h-4 text-forest-600" /> {formatDate(project.startDate)}
              {project.endDate ? ` – ${formatDate(project.endDate)}` : " onwards"}
            </span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 mt-10">
        <div>
          <div className="card p-8">
            <h2 className="font-display text-xl font-semibold text-charcoal mb-4">About this project</h2>
            <p className="prose-eco whitespace-pre-line">{project.description}</p>
          </div>

          {project.media.length > 0 && (
            <div className="card p-8 mt-6">
              <h2 className="font-display text-xl font-semibold text-charcoal mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-forest-600" /> Gallery
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {project.media.map((m) => (
                  <div key={m.id} className="rounded-xl overflow-hidden border border-sage-200 bg-sage-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/media/${m.id}`} alt={m.altText ?? m.caption ?? "Project photo"} className="w-full h-32 object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside>
          <div className="card p-7">
            <h2 className="font-display text-lg font-semibold text-charcoal flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-forest-600" /> Verified collections
            </h2>
            {totalKg > 0 && (
              <p className="font-display text-3xl font-semibold text-forest-800 mt-3">
                {formatIN(totalKg)} kg <span className="text-sm font-normal text-charcoal-soft">verified total (kg only)</span>
              </p>
            )}
            {project.records.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No verified records yet" hint="Only weighed, verified records appear here." />
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {project.records.slice(0, 8).map((r) => (
                  <li key={r.id} className="flex items-center justify-between text-sm border-b border-sage-200 pb-2.5 last:border-0">
                    <span className="text-charcoal-soft">{formatDate(r.collectionDate)} · {r.locality}</span>
                    <span className="font-semibold text-forest-800">{formatIN(r.quantity)} {r.unit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
