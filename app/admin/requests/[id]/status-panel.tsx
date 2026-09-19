"use client";

import { useActionState } from "react";
import { updateRequestStatus, addInternalNote } from "@/app/admin/actions";
import { SubmitButton, useToast, Badge, STATUS_TONES } from "@/components/ui";
import { STATUS_LABELS, REQUEST_STATUSES } from "@/lib/domain";
import { useEffect } from "react";
import { History } from "lucide-react";

type State = { ok: boolean; error?: string; message?: string };

export function RequestStatusPanel({
  requestId,
  currentStatus,
  nextStatuses,
  scheduledDate,
  assignedEventId,
  events,
}: {
  requestId: string;
  currentStatus: string;
  nextStatuses: string[];
  scheduledDate: string;
  assignedEventId: string;
  events: Array<{ id: string; title: string; date: string }>;
}) {
  const { push } = useToast();

  const [state, action] = useActionState<State, FormData>(async (prev, fd) => {
    const res = await updateRequestStatus(prev, fd);
    return res;
  }, { ok: false });

  const [noteState, noteAction] = useActionState<State, FormData>(async (prev, fd) => {
    return addInternalNote(prev, fd);
  }, { ok: false });

  useEffect(() => {
    if (state.message) push("success", state.message);
    if (state.error) push("error", state.error);
  }, [state]);

  useEffect(() => {
    if (noteState.message) push("success", noteState.message);
    if (noteState.error) push("error", noteState.error);
  }, [noteState]);

  return (
    <div className="card p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-charcoal mb-3">Update status</h3>
        <form action={action} className="space-y-3.5">
          <input type="hidden" name="requestId" value={requestId} />
          <div>
            <label htmlFor="s-status" className="label">New status</label>
            <select id="s-status" name="newStatus" className="input" required>
              <option value="" disabled>Choose next status…</option>
              {nextStatuses.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
              ))}
            </select>
            <p className="field-hint">Invalid transitions are blocked server-side.</p>
          </div>
          <div>
            <label htmlFor="s-date" className="label">Scheduled date (optional)</label>
            <input id="s-date" type="date" name="scheduledDate" defaultValue={scheduledDate} className="input" />
            <p className="field-hint">Stored separately from the resident&apos;s preferred date.</p>
          </div>
          <div>
            <label htmlFor="s-event" className="label">Link to event (optional)</label>
            <select id="s-event" name="assignedEventId" defaultValue={assignedEventId} className="input">
              <option value="">— none —</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.title} · {e.date}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="s-note" className="label">Note to resident (optional)</label>
            <textarea id="s-note" name="note" className="input min-h-[4.5rem]" placeholder="Safe for the resident to read — appears in their tracking timeline." />
          </div>
          <SubmitButton className="w-full" pendingLabel="Updating…">Apply update</SubmitButton>
        </form>
      </div>

      <div className="border-t border-sage-200 pt-5">
        <h3 className="font-semibold text-charcoal mb-3 flex items-center gap-2 text-sm">
          <History className="w-4 h-4 text-forest-600" /> Add internal note
        </h3>
        <form action={noteAction} className="space-y-3">
          <input type="hidden" name="requestId" value={requestId} />
          <textarea name="note" className="input min-h-[3.5rem]" placeholder="Visible to staff only…" required />
          <SubmitButton className="btn-sm w-full" pendingLabel="Saving…">Add note</SubmitButton>
        </form>
      </div>
    </div>
  );
}
