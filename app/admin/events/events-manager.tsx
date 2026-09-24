"use client";

import { useState, useActionState } from "react";
import { upsertEvent, setEventStatus, deleteEvent } from "@/app/admin/actions";
import { SubmitButton, useToast, ConfirmDialog, Badge } from "@/components/ui";
import { X, ChevronDown } from "lucide-react";

interface EventShape {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  locality: string;
  registrationDeadline: string;
  capacity: number | null;
  status: string;
}

type State = { ok: boolean; error?: string; message?: string; fieldErrors?: Record<string, string> };
const initial: State = { ok: false };

const NEXT_ACTIONS: Record<string, Array<[string, string]>> = {
  draft: [["published", "Publish"], ["cancelled", "Cancel event"]],
  published: [["completed", "Mark completed"], ["cancelled", "Cancel event"]],
  completed: [],
  cancelled: [["draft", "Back to draft"]],
};

export function EventsManager({
  mode,
  trigger,
  event,
}: {
  mode: "create" | "edit";
  trigger: React.ReactNode;
  event?: EventShape;
}) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [state, action] = useActionState<State, FormData>(async (prev, fd) => {
    const res = await upsertEvent(prev, fd);
    if (res.ok) {
      push("success", res.message ?? "Saved.");
      setOpen(false);
    } else if (res.error) push("error", res.error);
    return res;
  }, initial);

  async function doStatus(status: string) {
    const fd = new FormData();
    fd.set("id", event!.id);
    fd.set("status", status);
    const res = await setEventStatus({ ok: false }, fd);
    if (res.ok) push("success", res.message ?? "Updated.");
    else push("error", res.error ?? "Failed.");
  }

  async function doDelete() {
    const fd = new FormData();
    fd.set("id", event!.id);
    const res = await deleteEvent({ ok: false }, fd);
    if (res.ok) {
      push("success", res.message ?? "Deleted.");
      setOpen(false);
    } else push("error", res.error ?? "Delete failed.");
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex">{trigger}</button>

      {open && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Event editor">
          <div className="absolute inset-0 bg-forest-950/45 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-sage-200 shadow-lift w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-charcoal">{mode === "create" ? "New event" : "Manage event"}</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="btn btn-ghost btn-sm px-2"><X className="w-4.5 h-4.5" /></button>
            </div>

            {mode === "edit" && event && (
              <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-sage-200">
                <Badge tone={event.status === "published" ? "leaf" : "amber"}>{event.status}</Badge>
                {NEXT_ACTIONS[event.status]?.map(([status, label]) => (
                  <button key={status} onClick={() => doStatus(status)} className="btn btn-secondary btn-sm">
                    {label}
                  </button>
                ))}
              </div>
            )}

            <form action={action} className="space-y-4">
              {event && <input type="hidden" name="id" value={event.id} />}
              <div>
                <label className="label">Title *</label>
                <input name="title" required defaultValue={event?.title} className="input" placeholder="e.g. Bhabola beach clean-up drive" />
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea name="description" required defaultValue={event?.description} className="input min-h-[6rem]" placeholder="What happens, who should join, what to bring…" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Date *</label>
                  <input type="date" name="eventDate" required defaultValue={event?.eventDate} className="input" />
                </div>
                <div>
                  <label className="label">Locality *</label>
                  <input name="locality" required defaultValue={event?.locality} className="input" placeholder="e.g. Vasai-West" />
                </div>
                <div>
                  <label className="label">Start time</label>
                  <input type="time" name="startTime" defaultValue={event?.startTime} className="input" />
                </div>
                <div>
                  <label className="label">End time</label>
                  <input type="time" name="endTime" defaultValue={event?.endTime} className="input" />
                </div>
                <div>
                  <label className="label">Registration deadline</label>
                  <input type="date" name="registrationDeadline" defaultValue={event?.registrationDeadline} className="input" />
                </div>
                <div>
                  <label className="label">Capacity (optional)</label>
                  <input type="number" name="capacity" min="1" defaultValue={event?.capacity ?? ""} className="input" placeholder="e.g. 40" />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <SubmitButton className="btn-sm" pendingLabel="Saving…">{mode === "create" ? "Create draft" : "Save changes"}</SubmitButton>
              </div>
            </form>

            {mode === "edit" && event && (
              <div className="mt-6 pt-4 border-t border-sage-200 flex items-center justify-between">
                <p className="text-xs text-charcoal-soft/70">Deleting also removes registrations.</p>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>Delete event</button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        destructive
        title="Delete this event?"
        body="This permanently removes the event and its volunteer registrations. Consider marking it completed or cancelled instead."
        confirmLabel="Delete event"
        onConfirm={doDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
