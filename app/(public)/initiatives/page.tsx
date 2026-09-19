import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { CATEGORY_LABELS } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { Reveal, SectionHeading, Badge, EmptyState } from "@/components/ui";
import { MapPin, CalendarRange, ArrowRight, SearchX } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Initiatives & Projects",
  description: "Ongoing and completed environmental projects by Whispering Green Foundation in Vasai-West.",
};

export default async function InitiativesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const where = {
    visibility: "published" as const,
    AND: [
      q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }, { locality: { contains: q } }] } : {},
      category ? { category } : {},
    ],
  };

  const projects = await prisma.project.findMany({ where, orderBy: { updatedAt: "desc" } });

  const categories = ["waste", "education", "cleanup", "other"];
  const CATEGORY_UI: Record<string, string> = {
    waste: "Waste management",
    education: "Education",
    cleanup: "Clean-up drives",
    other: "Other",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
      <Reveal>
        <SectionHeading
          eyebrow="Our work"
          title="Initiatives & projects"
          sub="Every project here is active or completed work on the ground in Vasai-West. Draft and unverified projects stay visible to staff only."
        />
      </Reveal>

      <Reveal>
        <form className="flex flex-col sm:flex-row gap-3 mb-8" role="search">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search projects, localities…"
            className="input sm:max-w-xs"
            aria-label="Search projects"
          />
          <select name="category" defaultValue={category ?? ""} className="input sm:max-w-[12rem]" aria-label="Filter by category">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{CATEGORY_UI[c]}</option>
            ))}
          </select>
          <button className="btn btn-primary">Filter</button>
          {(q || category) && (
            <Link href="/initiatives" className="btn btn-ghost">Clear</Link>
          )}
        </form>
      </Reveal>

      {projects.length === 0 ? (
        <EmptyState
          icon={<SearchX className="w-5 h-5" />}
          title="No projects match"
          hint={q || category ? "Try a different search or category." : "Published projects will appear here once staff publish them."}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <Link href={`/projects/${p.slug}`} className="card card-hover block p-6 h-full group">
                <div className="flex items-center justify-between">
                  <Badge tone="green">{CATEGORY_UI[p.category] ?? p.category}</Badge>
                  <Badge tone={p.status === "active" ? "leaf" : p.status === "completed" ? "gray" : "amber"}>
                    {p.status}
                  </Badge>
                </div>
                <h2 className="font-display text-lg font-semibold text-charcoal mt-3.5 group-hover:text-forest-700 transition-colors">
                  {p.title}
                </h2>
                <p className="text-sm text-charcoal-soft mt-2 line-clamp-3 leading-relaxed">{p.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-soft/75 mt-4">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {p.locality}</span>
                  {p.startDate && (
                    <span className="flex items-center gap-1">
                      <CalendarRange className="w-3.5 h-3.5" /> {formatDate(p.startDate)}
                      {p.endDate ? ` – ${formatDate(p.endDate)}` : " onwards"}
                    </span>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
