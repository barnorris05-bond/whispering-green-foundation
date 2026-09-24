"use client";

import { useState } from "react";
import { useActionState } from "react";
import { upsertCollectionRecord, deleteCollectionRecord } from "@/app/admin/actions";
import { SubmitButton, useToast, ConfirmDialog } from "@/components/ui";
import { WASTE_CATEGORIES, CATEGORY_LABELS, MEASUREMENT_TYPES, VERIFICATION_STATUSES, UNITS } from "@/lib/domain";
import { toDateInput } from "@/lib/format";
import { X } from "lucide-react";

interface Option { id: string; title: string }
interface RecordShape {
  id: string;
  collectionDate: string;
  locality: string;
  category: string;
  quantity: number;
  unit: string;
  measurementType: string;
  verificationStatus: string;
  notes: string;
  eventId: string;
  projectId: string;
  requestId: string;
}

type State = { ok: boolean; error?: string; message?: string; fieldErrors?: Record<string, string> };

const initial: State = { ok: false };

export function RecordsManager({
  trigger,
  mode,
  record,
  requests,
  events,
  projects,
  prefillRequestId,
}: {
  trigger: React.ReactNode;
  mode: "create" | "edit";
  record?: RecordShape;
  requests: Option[];
  events: Option[];
  projects: Option[];
  prefillRequestId?: string;
}) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [state, action] = useActionState<State, FormData>(async (prev, fd) => {
    const res = await upsertCollectionRecord(prev, fd);
    if (res.ok) {
      push("success", res.message ?? "Saved.");
      setOpen(false);
    } else if (res.error) {
      push("error", res.error);
    }
    return res;
  }, initial);

  async function onDelete(fd: FormData) {
    const res = await deleteCollectionRecord({ ok: false }, fd);
    if (res.ok) {
      push("success", res.message ?? "Deleted.");
      setOpen(false);
    } else {
      push("error", res.error ?? "Delete failed.");
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex">{trigger}</button>

      {open && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={mode === "create" ? "Add collection record" : "Edit collection record"}>
          <div className="absolute inset-0 bg-forest-950/45 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-sage-200 shadow-lift w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-charcoal">
                {mode === "create" ? "Add collection record" : `Edit record`}
              </h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="btn btn-ghost btn-sm px-2">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form action={action} className="space-y-4">
              {record && <input type="hidden" name="id" value={record.id} />}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Collection date *</label>
                  <input type="date" name="collectionDate" required defaultValue={record?.collectionDate ?? toDateInput(new Date())} className="input" />
                </div>
                <div>
                  <label className="label">Locality *</label>
                  <input name="locality" required defaultValue={record?.locality} className="input" placeholder="e.g. Bhabola" />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select name="category" required defaultValue={record?.category ?? "plastic"} className="input">
                    {WASTE_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Quantity *</label>
                  <div className="flex gap-2">
                    <input type="number" name="quantity" step="0.1" min="0" required defaultValue={record?.quantity} className="input" placeholder="e.g. 120" />
                    <select name="unit" defaultValue={record?.unit ?? "kg"} className="input w-24" aria-label="Unit">
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Measurement *</label>
                  <select name="measurementType" defaultValue={record?.measurementType ?? "measured"} className="input">
                    {MEASUREMENT_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Verification *</label>
                  <select name="verificationStatus" defaultValue={record?.verificationStatus ?? "draft"} className="input">
                    {VERIFICATION_STATUSES.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <p className="field-hint">Only “verified” counts publicly.</p>
                </div>
                <div>
                  <label className="label">Linked request (optional)</label>
                  <select name="requestId" defaultValue={record?.requestId ?? prefillRequestId ?? ""} className="input">
                    <option value="">— none —</option>
                    {requests.map((r) => <option key={r.id} value={r.id}>{r.title || r.id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Linked event (optional)</label>
                  <select name="eventId" defaultValue={record?.eventId ?? ""} className="input">
                    <option value="">— none —</option>
                    {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Linked project (optional)</label>
                  <select name="projectId" defaultValue={record?.projectId ?? ""} className="input">
                    <option value="">— none —</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Notes</label>
                  <textarea name="notes" defaultValue={record?.notes} className="input min-h-[4rem]" placeholder="e.g. weighed on-site with handheld scale" />
                </div>
              </div>

              {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {Object.values(state.fieldErrors)[0]}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                {mode === "edit" ? (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>Delete record</button>
                ) : <span />}
                <div className="flex gap-2.5">
                  <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <SubmitButton className="btn-sm" pendingLabel="Saving…">{mode === "create" ? "Add record" : "Save changes"}</SubmitButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        destructive
        title="Delete this record?"
        body="The record will be permanently removed. If it was verified, public impact totals will decrease."
        confirmLabel="Delete record"
        onConfirm={() => {
          const fd = new FormData();
          fd.set("id", record!.id);
          onDelete(fd);
        }}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
