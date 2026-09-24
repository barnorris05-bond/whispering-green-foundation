"use client";

import { useState, useActionState } from "react";
import { upsertProject, deleteProject } from "@/app/admin/actions";
import { SubmitButton, useToast, ConfirmDialog, Badge } from "@/components/ui";
import { X } from "lucide-react";

interface ProjectShape {
  id: string;
  title: string;
  category: string;
  description: string;
  locality: string;
  startDate: string;
  endDate: string;
  status: string;
  visibility: string;
}

type State = { ok: boolean; error?: string; message?: string; fieldErrors?: Record<string, string> };
const initial: State = { ok: false };

const CATEGORIES = [
  ["waste", "Waste management"],
  ["education", "Education"],
  ["cleanup", "Clean-up drives"],
  ["other", "Other"],
];

export function ProjectsManager({
  mode,
  trigger,
  project,
}: {
  mode: "create" | "edit";
  trigger: React.ReactNode;
  project?: ProjectShape;
}) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [state, action] = useActionState<State, FormData>(async (prev, fd) => {
    const res = await upsertProject(prev, fd);
    if (res.ok) {
      push("success", res.message ?? "Saved.");
      setOpen(false);
    } else if (res.error) push("error", res.error);
    return res;
  }, initial);

  async function toggleVisibility() {
    const fd = new FormData();
    fd.set("id", project!.id);
    fd.set("title", project!.title);
    fd.set("category", project!.category);
    fd.set("description", project!.description);
    fd.set("locality", project!.locality);
    fd.set("startDate", project!.startDate);
    fd.set("endDate", project!.endDate);
    fd.set("status", project!.status);
    fd.set("visibility", project!.visibility === "published" ? "draft" : "published");
    const res = await upsertProject({ ok: false }, fd);
    if (res.ok) push("success", res.message ?? "Updated.");
    else push("error", res.error ?? "Failed.");
  }

  async function doDelete() {
    const fd = new FormData();
    fd.set("id", project!.id);
    const res = await deleteProject({ ok: false }, fd);
    if (res.ok) {
      push("success", res.message ?? "Deleted.");
      setOpen(false);
    } else push("error", res.error ?? "Delete failed.");
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex">{trigger}</button>

      {open && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Project editor">
          <div className="absolute inset-0 bg-forest-950/45 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-sage-200 shadow-lift w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-charcoal">{mode === "create" ? "New project" : "Manage project"}</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="btn btn-ghost btn-sm px-2"><X className="w-4.5 h-4.5" /></button>
            </div>

            {mode === "edit" && project && (
              <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-sage-200">
                <Badge tone={project.status === "active" ? "leaf" : "amber"}>{project.status}</Badge>
                <Badge tone={project.visibility === "published" ? "green" : "demo"}>{project.visibility}</Badge>
                <button onClick={toggleVisibility} className="btn btn-secondary btn-sm">
                  {project.visibility === "published" ? "Unpublish" : "Publish"}
                </button>
              </div>
            )}

            <form action={action} className="space-y-4">
              {project && <input type="hidden" name="id" value={project.id} />}
              <div>
                <label className="label">Title *</label>
                <input name="title" required defaultValue={project?.title} className="input" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select name="category" defaultValue={project?.category ?? "waste"} className="input">
                    {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Locality *</label>
                  <input name="locality" required defaultValue={project?.locality} className="input" />
                </div>
                <div>
                  <label className="label">Status *</label>
                  <select name="status" defaultValue={project?.status ?? "draft"} className="input">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="label">Visibility *</label>
                  <select name="visibility" defaultValue={project?.visibility ?? "draft"} className="input">
                    <option value="draft">Draft (staff only)</option>
                    <option value="published">Published (public)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Start date</label>
                  <input type="date" name="startDate" defaultValue={project?.startDate} className="input" />
                </div>
                <div>
                  <label className="label">End date</label>
                  <input type="date" name="endDate" defaultValue={project?.endDate} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea name="description" required defaultValue={project?.description} className="input min-h-[8rem]" />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <SubmitButton className="btn-sm" pendingLabel="Saving…">{mode === "create" ? "Create project" : "Save changes"}</SubmitButton>
              </div>
            </form>

            {mode === "edit" && (
              <div className="mt-6 pt-4 border-t border-sage-200 flex items-center justify-between">
                <p className="text-xs text-charcoal-soft/70">Deleting fails if records/media still reference the project.</p>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>Delete project</button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        destructive
        title="Delete this project?"
        body="This permanently removes the project. Linked records keep existing but lose the association."
        confirmLabel="Delete"
        onConfirm={doDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
