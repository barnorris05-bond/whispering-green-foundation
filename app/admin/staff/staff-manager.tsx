"use client";

import { useState, useActionState } from "react";
import { createStaff, toggleStaffActive, resetStaffPassword } from "@/app/admin/actions";
import { SubmitButton, useToast, ConfirmDialog } from "@/components/ui";
import { X } from "lucide-react";

type State = { ok: boolean; error?: string; message?: string; fieldErrors?: Record<string, string> };
const initial: State = { ok: false };

export function StaffManager({
  mode,
  trigger,
  user,
}: {
  mode: "create" | "manage";
  trigger: React.ReactNode;
  user?: { id: string; name: string; isActive: boolean };
}) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);

  const [state, action] = useActionState<State, FormData>(async (prev, fd) => {
    const res = await createStaff(prev, fd);
    if (res.ok) {
      push("success", res.message ?? "Created.");
      setOpen(false);
    } else if (res.error) push("error", res.error);
    return res;
  }, initial);

  async function toggleActive() {
    const fd = new FormData();
    fd.set("id", user!.id);
    const res = await toggleStaffActive({ ok: false }, fd);
    if (res.ok) push("success", res.message ?? "Updated.");
    else push("error", res.error ?? "Failed.");
  }

  async function resetPassword(fd: FormData) {
    const res = await resetStaffPassword({ ok: false }, fd);
    if (res.ok) {
      push("success", res.message ?? "Reset.");
      setOpen(false);
    } else push("error", res.error ?? "Failed.");
  }

  if (mode === "create") {
    return (
      <>
        <span onClick={() => setOpen(true)} className="cursor-pointer inline-flex">{trigger}</span>
        {open && (
          <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Add staff">
            <div className="absolute inset-0 bg-forest-950/45 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
            <div className="relative bg-white rounded-2xl border border-sage-200 shadow-lift w-full max-w-md p-6 animate-scale-in">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg font-semibold text-charcoal">Add staff account</h3>
                <button onClick={() => setOpen(false)} aria-label="Close" className="btn btn-ghost btn-sm px-2"><X className="w-4.5 h-4.5" /></button>
              </div>
              <form action={action} className="space-y-4">
                <div>
                  <label className="label">Name *</label>
                  <input name="name" required className="input" placeholder="Full name" />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input name="email" type="email" required className="input" placeholder="name@wgf.demo" />
                </div>
                <div>
                  <label className="label">Temporary password *</label>
                  <input name="password" type="text" required minLength={8} className="input font-mono" placeholder="At least 8 characters" />
                  <p className="field-hint">They must change it at first sign-in.</p>
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <SubmitButton className="btn-sm" pendingLabel="Creating…">Create account</SubmitButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer inline-flex">{trigger}</span>
      {open && user && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Manage staff">
          <div className="absolute inset-0 bg-forest-950/45 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-sage-200 shadow-lift w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-charcoal">Manage — {user.name}</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="btn btn-ghost btn-sm px-2"><X className="w-4.5 h-4.5" /></button>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal">Account status</p>
                  <p className="text-xs text-charcoal-soft mt-0.5">{user.isActive ? "Active — can sign in" : "Disabled — cannot sign in"}</p>
                </div>
                <button onClick={() => setConfirmDisable(true)} className={`btn btn-sm ${user.isActive ? "btn-danger" : "btn-primary"}`}>
                  {user.isActive ? "Disable" : "Enable"}
                </button>
              </div>

              <form action={resetPassword} className="border-t border-sage-200 pt-5 space-y-3">
                <input type="hidden" name="id" value={user.id} />
                <p className="text-sm font-medium text-charcoal">Reset password</p>
                <input name="password" type="text" required minLength={8} className="input font-mono" placeholder="New temporary password" />
                <SubmitButton className="btn-sm" pendingLabel="Resetting…">Reset password</SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmDisable}
        destructive={user?.isActive ?? false}
        title={user?.isActive ? "Disable this account?" : "Enable this account?"}
        body={user?.isActive
          ? "They will be signed out everywhere and cannot log in until re-enabled."
          : "They will be able to sign in again."}
        confirmLabel={user?.isActive ? "Disable" : "Enable"}
        onConfirm={toggleActive}
        onClose={() => setConfirmDisable(false)}
      />
    </>
  );
}
