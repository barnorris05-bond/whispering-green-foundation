"use client";

import { useActionState } from "react";
import { updateRequestStatus, addInternalNote } from "@/app/admin/actions";
import { SubmitButton, useToast, Badge, STATUS_TONES } from "@/components/ui";
import { STATUS_LABELS } from "@/lib/domain";
import { toDateInput } from "@/lib/format";
import { useEffect } from "react";
import { History, CheckCircle2, CalendarClock, XCircle, Eye, PlayCircle, Ban } from "lucide-react";

type State = { ok: boolean; error?: string; message?: string };

/** Which transitions get which treatment in the action bar. */
const ACTION_META: Record<string, { label: string; icon: React.ReactNode; className: string; confirm?: string }> = {
  under_review: {
    label: "Start review",
    icon: <Eye className="w-4 h-4" />,
    className: "btn btn-secondary btn-sm",
  },
  approved: {
    label: "Approve",
    icon: <CheckCircle2 className="w-4 h-4" />,
    className: "btn btn-primary btn-sm",
  },
  scheduled: {
    label: "Schedule",
    icon: <CalendarClock className="w-4 h-4" />,
    className: "btn btn-primary btn-sm",
  },
  in_progress: {
    label: "Start collection",
    icon: <PlayCircle className="w-4 h-4" />,
    className: "btn btn-primary btn-sm",
  },
  completed: {
    label: "Mark completed",
    icon: <CheckCircle2 className="w-4 h-4" />,
    className: "btn btn-primary btn-sm",
    confirm: "Mark this collection as completed? The resident will see this status when tracking the request.",
  },
  rejected: {
    label: "Reject…",
    icon: <XCircle className="w-4 h-4" />,
    className: "btn btn-danger btn-sm",
    confirm: "Reject this request? A reason is required and the resident will see that a decision was made.",
  },
  cancelled: {
    label: "Cancel…",
    icon: <Ban className="w-4 h-4" />,
    className: "btn btn-danger btn-sm",
    confirm: "Cancel this request? A reason is required.",
  },
};

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
    return updateRequestStatus(prev, fd);
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

  const needsReason = (s: string) => s === "rejected" || s === "cancelled";

  if (nextStatuses.length === 0) {
    return (
      <div className="card p-6 space-y-5">
        <div>
          <h3 className="font-semibold text-charcoal mb-2">Update status</h3>
          <p className="text-sm text-charcoal-soft leading-relaxed">
            This request is <Badge tone={STATUS_TONES[currentStatus]}>{STATUS_LABELS[currentStatus] ?? currentStatus}</Badge> — a
            final state with no further transitions. If it was rejected or cancelled by mistake, the resident can submit a new request.
          </p>
        </div>
        <NoteForm noteState={noteState} noteAction={noteAction} requestId={requestId} />
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-charcoal mb-1">Actions</h3>
        <p className="text-xs text-charcoal-soft/80 mb-3">
          Current: <Badge tone={STATUS_TONES[currentStatus]}>{STATUS_LABELS[currentStatus] ?? currentStatus}</Badge>
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Request workflow actions">
          {nextStatuses.filter((s) => !needsReason(s) && s !== "scheduled").map((s) => {
            const meta = ACTION_META[s] ?? { label: STATUS_LABELS[s] ?? s, icon: null, className: "btn btn-secondary btn-sm" };
            return (
              <form key={s} action={action} className="contents">
                <input type="hidden" name="requestId" value={requestId} />
                <input type="hidden" name="newStatus" value={s} />
                <SubmitButton
                  className={meta.className}
                  pendingLabel="Updating…"
                  onClick={(e) => {
                    if (meta.confirm && !window.confirm(meta.confirm)) e.preventDefault();
                  }}
                >
                  {meta.icon}
                  {meta.label}
                </SubmitButton>
              </form>
            );
          })}
        </div>
        {(nextStatuses.includes("scheduled")) && (
          <form action={action} className="mt-4 space-y-3 border-t border-sage-200 pt-4">
            <input type="hidden" name="requestId" value={requestId} />
            <input type="hidden" name="newStatus" value="scheduled" />
            <p className="text-sm font-medium text-charcoal">Schedule a collection</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="s-date" className="label text-xs">Collection date</label>
                <input id="s-date" type="date" name="scheduledDate" defaultValue={scheduledDate} min={toDateInput(new Date())} className="input" required />
              </div>
              <div>
                <label htmlFor="s-event" className="label text-xs">Link event (optional)</label>
                <select id="s-event" name="assignedEventId" defaultValue={assignedEventId} className="input">
                  <option value="">— none —</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title} · {ev.date}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="s-window" className="label text-xs">Time window / instructions to resident (optional)</label>
              <input id="s-window" name="note" className="input" placeholder="e.g. Morning, 9–11 am. Keep waste sorted and accessible." />
            </div>
            <SubmitButton className="btn btn-primary btn-sm w-full" pendingLabel="Scheduling…">
              <CalendarClock className="w-4 h-4" /> Confirm schedule
            </SubmitButton>
            <p className="field-hint">Past dates are rejected. Reschedule any time by scheduling again.</p>
          </form>
        )}
        {nextStatuses.some((s) => needsReason(s)) && (
        <form action={action} className="mt-4 space-y-3 border-t border-sage-200 pt-4">
          <input type="hidden" name="requestId" value={requestId} />
          <div>
            <label htmlFor="s-note" className="label text-xs">
              Note to resident <span className="text-charcoal-soft/60">(a reason is required for the actions below)</span>
            </label>
            <textarea id="s-note" name="note" className="input min-h-[4rem]" placeholder="Safe for the resident to read — appears in their tracking timeline." />
          </div>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.filter((s) => needsReason(s)).map((s) => {
              const meta = ACTION_META[s]!;
              return (
                <SubmitButton
                  key={s}
                  className={meta.className}
                  pendingLabel="Updating…"
                  onClick={(e) => {
                    const form = (e.currentTarget as HTMLButtonElement).form;
                    const note = form?.querySelector<HTMLInputElement>('textarea[name="note"]')?.value.trim();
                    if (!note) {
                      e.preventDefault();
                      push("error", `A reason is required — write it in the note to resident, then press ${meta.label.replace("…", "")}.`);
                      form?.querySelector<HTMLTextAreaElement>('textarea[name="note"]')?.focus();
                    } else if (meta.confirm && !window.confirm(meta.confirm)) {
                      e.preventDefault();
                    }
                  }}
                >
                  {meta.icon}
                  {meta.label}
                </SubmitButton>
              );
            })}
          </div>
        </form>
        )}
      </div>

      <div className="border-t border-sage-200 pt-5">
        <NoteForm noteState={noteState} noteAction={noteAction} requestId={requestId} />
      </div>
    </div>
  );
}

function NoteForm({ noteState, noteAction, requestId }: { noteState: State; noteAction: (fd: FormData) => void; requestId: string }) {
  return (
    <form action={noteAction} className="space-y-3">
      <h3 className="font-semibold text-charcoal mb-1 flex items-center gap-2 text-sm">
        <History className="w-4 h-4 text-forest-600" /> Add internal note
      </h3>
      <input type="hidden" name="requestId" value={requestId} />
      <textarea name="note" className="input min-h-[3.5rem]" placeholder="Visible to staff only…" required aria-label="Internal note" />
      <SubmitButton className="btn-sm w-full" pendingLabel="Saving…">Add note</SubmitButton>
    </form>
  );
}
