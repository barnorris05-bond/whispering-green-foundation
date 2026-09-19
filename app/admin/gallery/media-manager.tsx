"use client";

import { useState, useActionState } from "react";
import { uploadMedia, setMediaVisibility, deleteMedia } from "@/app/admin/actions";
import { SubmitButton, useToast, ConfirmDialog } from "@/components/ui";
import { X } from "lucide-react";

interface MediaShape {
  id: string;
  caption: string;
  altText: string;
  visibility: string;
  eventId: string;
  projectId: string;
}
interface Option { id: string; title: string }

type State = { ok: boolean; error?: string; message?: string };
const initial: State = { ok: false };

export function MediaManager({
  mode,
  trigger,
  media,
  events,
  projects,
}: {
  mode: "upload" | "edit";
  trigger: React.ReactNode;
  media?: MediaShape;
  events: Option[];
  projects: Option[];
}) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [state, action] = useActionState<State, FormData>(async (prev, fd) => {
    const res = await uploadMedia(prev, fd);
    if (res.ok) {
      push("success", res.message ?? "Uploaded.");
      setOpen(false);
    } else if (res.error) push("error", res.error);
    return res;
  }, initial);

  async function doVisibility(visibility: string) {
    const fd = new FormData();
    fd.set("id", media!.id);
    fd.set("visibility", visibility);
    const res = await setMediaVisibility({ ok: false }, fd);
    if (res.ok) push("success", res.message ?? "Updated.");
    else push("error", res.error ?? "Failed.");
  }

  async function doDelete() {
    const fd = new FormData();
    fd.set("id", media!.id);
    const res = await deleteMedia({ ok: false }, fd);
    if (res.ok) {
      push("success", res.message ?? "Deleted.");
      setOpen(false);
    } else push("error", res.error ?? "Delete failed.");
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer inline-flex">{trigger}</span>

      {open && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Media manager">
          <div className="absolute inset-0 bg-forest-950/45 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-sage-200 shadow-lift w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-charcoal">{mode === "upload" ? "Upload photo" : "Manage photo"}</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="btn btn-ghost btn-sm px-2"><X className="w-4.5 h-4.5" /></button>
            </div>

            {mode === "upload" ? (
              <form action={action} className="space-y-4" encType="multipart/form-data">
                <div>
                  <label className="label">Image *</label>
                  <input
                    type="file"
                    name="file"
                    accept="image/png,image/jpeg,image/webp"
                    required
                    className="input file:mr-3 file:rounded-full file:border-0 file:bg-forest-50 file:px-3.5 file:py-1.5 file:text-sm file:font-medium file:text-forest-800"
                  />
                  <p className="field-hint">JPG, PNG or WebP · max 5 MB. Don&apos;t upload photos of people without consent.</p>
                </div>
                <div>
                  <label className="label">Caption</label>
                  <input name="caption" className="input" placeholder="e.g. Volunteers at Bhabola drive" />
                </div>
                <div>
                  <label className="label">Alt text (for screen readers)</label>
                  <input name="altText" className="input" placeholder="Describe the image for accessibility" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Visibility *</label>
                    <select name="visibility" defaultValue="approved" className="input">
                      <option value="approved">Approved (public)</option>
                      <option value="pending">Pending review</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Link to event</label>
                    <select name="eventId" className="input">
                      <option value="">— none —</option>
                      {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Link to project</label>
                  <select name="projectId" className="input">
                    <option value="">— none —</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <SubmitButton className="btn-sm" pendingLabel="Uploading…">Upload</SubmitButton>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="label">Visibility</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {["approved", "pending", "private"].map((v) => (
                      <button
                        key={v}
                        onClick={() => doVisibility(v)}
                        className={`btn btn-sm ${media!.visibility === v ? "btn-primary" : "btn-secondary"}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-sage-200 flex items-center justify-between">
                  <p className="text-xs text-charcoal-soft/70">Deleting removes the file from disk too.</p>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>Delete photo</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        destructive
        title="Delete this photo?"
        body="The database entry and stored file will be permanently removed."
        confirmLabel="Delete photo"
        onConfirm={doDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
