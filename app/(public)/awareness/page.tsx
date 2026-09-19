import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { CONTENT_CATEGORY_LABELS } from "@/lib/domain";
import { Reveal, SectionHeading, Badge, EmptyState } from "@/components/ui";
import { BookOpen, Clock, SearchX } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Awareness Portal",
  description: "Practical guides on waste segregation, plastic reduction, recycling and responsible disposal.",
};

export default async function AwarenessPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const where = {
    status: "published" as const,
    AND: [
      q ? { OR: [{ title: { contains: q } }, { excerpt: { contains: q } }, { body: { contains: q } }] } : {},
      category ? { category } : {},
    ],
  };

  const articles = await prisma.content.findMany({ where, orderBy: { publishedAt: "desc" } });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
      <Reveal>
        <SectionHeading
          eyebrow="Learn"
          title="Awareness portal"
          sub="Short, practical guides for Vasai-West households. Educational content only — always follow your local municipal waste rules."
        />
      </Reveal>

      <Reveal>
        <form className="flex flex-col sm:flex-row gap-3 mb-8" role="search">
          <input type="search" name="q" defaultValue={q} placeholder="Search articles…" className="input sm:max-w-xs" aria-label="Search articles" />
          <select name="category" defaultValue={category ?? ""} className="input sm:max-w-[13rem]" aria-label="Filter by category">
            <option value="">All topics</option>
            {Object.entries(CONTENT_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button className="btn btn-primary">Search</button>
          {(q || category) && <Link href="/awareness" className="btn btn-ghost">Clear</Link>}
        </form>
      </Reveal>

      {articles.length === 0 ? (
        <EmptyState
          icon={<SearchX className="w-5 h-5" />}
          title="No articles found"
          hint={q || category ? "Try different keywords or another topic." : "Published articles will appear here."}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.06}>
              <Link href={`/awareness/${a.slug}`} className="card card-hover block p-6 h-full group">
                <Badge tone="leaf">{CONTENT_CATEGORY_LABELS[a.category] ?? a.category}</Badge>
                <h2 className="font-display text-lg font-semibold text-charcoal mt-3.5 group-hover:text-forest-700 transition-colors">
                  {a.title}
                </h2>
                <p className="text-sm text-charcoal-soft mt-2 line-clamp-3 leading-relaxed">{a.excerpt}</p>
                <p className="flex items-center gap-1.5 text-xs text-charcoal-soft/70 mt-4">
                  <Clock className="w-3.5 h-3.5" /> {a.readMinutes} min read · {formatDate(a.publishedAt)}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
