import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { CONTENT_CATEGORIES, CONTENT_CATEGORY_LABELS } from "@/lib/domain";
import { Badge, EmptyState } from "@/components/ui";
import { Newspaper, Plus } from "lucide-react";
import { ContentManager } from "./content-manager";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const articles = await prisma.content.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-charcoal">Awareness content</h2>
          <p className="text-sm text-charcoal-soft mt-1">Draft, preview, publish, unpublish and archive articles.</p>
        </div>
        <ContentManager
          mode="create"
          trigger={<span className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> New article</span>}
        />
      </div>

      {articles.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="w-5 h-5" />}
          title="No articles yet"
          hint="Write awareness content — it stays a draft until published."
        />
      ) : (
        <div className="grid gap-3">
          {articles.map((a) => (
            <div key={a.id} className="card p-5 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[14rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-charcoal">{a.title}</h3>
                  <Badge tone={a.status === "published" ? "leaf" : a.status === "draft" ? "amber" : "gray"}>{a.status}</Badge>
                </div>
                <p className="text-xs text-charcoal-soft mt-1">
                  {CONTENT_CATEGORY_LABELS[a.category] ?? a.category}
                  {a.publishedAt ? ` · published ${formatDate(a.publishedAt)}` : " · not published"}
                </p>
              </div>
              <ContentManager
                mode="edit"
                trigger={<span className="btn btn-secondary btn-sm">Edit</span>}
                article={{
                  id: a.id,
                  title: a.title,
                  category: a.category,
                  excerpt: a.excerpt ?? "",
                  body: a.body,
                  readMinutes: a.readMinutes,
                  status: a.status,
                  slug: a.slug,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
