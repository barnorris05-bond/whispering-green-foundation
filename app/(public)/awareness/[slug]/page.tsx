import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { CONTENT_CATEGORY_LABELS } from "@/lib/domain";
import { Badge, Breadcrumbs, EmptyState } from "@/components/ui";
import { Clock, ArrowRight, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await prisma.content.findUnique({ where: { slug } });
  if (!a || a.status !== "published") return { title: "Article" };
  return { title: a.title, description: a.excerpt ?? undefined };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.content.findUnique({ where: { slug } });
  if (!article || article.status !== "published") notFound();

  const related = await prisma.content.findMany({
    where: { status: "published", category: article.category, id: { not: article.id } },
    take: 2,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-10">
      <Breadcrumbs items={[{ href: "/awareness", label: "Awareness" }, { label: article.title }]} />

      <article className="mt-8">
        <Badge tone="leaf">{CONTENT_CATEGORY_LABELS[article.category] ?? article.category}</Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-forest-950 tracking-tight mt-4 leading-tight">
          {article.title}
        </h1>
        <p className="flex items-center gap-2 text-sm text-charcoal-soft/75 mt-4">
          <Clock className="w-4 h-4" /> {article.readMinutes} min read · Published {formatDate(article.publishedAt)}
        </p>

        {article.excerpt && (
          <p className="text-lg text-charcoal-soft leading-relaxed mt-6 border-l-4 border-leaf-300 pl-5 italic">
            {article.excerpt}
          </p>
        )}

        <div className="prose-eco mt-8 whitespace-pre-line">
          {article.body}
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-sage-200 bg-sage-50 px-4 py-3.5 mt-10 text-xs text-charcoal-soft">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-forest-600" />
          <span>
            This article is general awareness material, not an official collection instruction. For collections,
            use <Link href="/request-collection" className="text-forest-700 underline underline-offset-2">Request collection</Link>.
          </span>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-charcoal mb-5">Related reading</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={`/awareness/${r.slug}`} className="card card-hover p-5 group">
                <Badge tone="leaf">{CONTENT_CATEGORY_LABELS[r.category] ?? r.category}</Badge>
                <h3 className="font-semibold text-charcoal mt-2.5 group-hover:text-forest-700">{r.title}</h3>
                <p className="text-sm text-charcoal-soft mt-1.5 line-clamp-2">{r.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-xs text-forest-700 mt-3 font-medium">
                  Read <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
