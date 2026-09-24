import { prisma } from "@/lib/db";
import { Badge, EmptyState } from "@/components/ui";
import { toDateInput } from "@/lib/format";
import { FolderKanban, Plus } from "lucide-react";
import { ProjectsManager } from "./projects-manager";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-charcoal">Projects</h2>
          <p className="text-sm text-charcoal-soft mt-1">Projects appear publicly only when visibility is “published”.</p>
        </div>
        <ProjectsManager
          mode="create"
          trigger={<span className="btn btn-primary btn-sm"><Plus className="w-4 h-4" /> New project</span>}
        />
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-5 h-5" />}
          title="No projects yet"
          hint="Create a project to group events, records and media."
        />
      ) : (
        <div className="grid gap-3">
          {projects.map((p) => (
            <div key={p.id} className="card p-5 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[14rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-charcoal">{p.title}</h3>
                  <Badge tone={p.status === "active" ? "leaf" : p.status === "completed" ? "gray" : "amber"}>{p.status}</Badge>
                  <Badge tone={p.visibility === "published" ? "green" : "demo"}>{p.visibility}</Badge>
                </div>
                <p className="text-xs text-charcoal-soft mt-1 line-clamp-1">{p.locality} · {p.description}</p>
              </div>
              <ProjectsManager
                mode="edit"
                trigger={<span className="btn btn-secondary btn-sm">Manage</span>}
                project={{
                  id: p.id,
                  title: p.title,
                  category: p.category,
                  description: p.description,
                  locality: p.locality,
                  startDate: toDateInput(p.startDate),
                  endDate: toDateInput(p.endDate),
                  status: p.status,
                  visibility: p.visibility,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
