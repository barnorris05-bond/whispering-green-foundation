"use client";

import { useActionState, useEffect } from "react";
import { changeOwnPassword } from "@/app/admin/actions";
import { SubmitButton, useToast } from "@/components/ui";

type State = { ok: boolean; error?: string; message?: string; fieldErrors?: Record<string, string> };

export function PasswordForm() {
  const { push } = useToast();
  const [state, action] = useActionState<State, FormData>(async (prev, fd) => {
    const res = await changeOwnPassword(prev, fd);
    return res;
  }, { ok: false });

  useEffect(() => {
    if (state.message) push("success", state.message);
    if (state.error) push("error", state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4 max-w-md">
      <div>
        <label className="label">Current password</label>
        <input name="current" type="password" required autoComplete="current-password" className={`input ${state.fieldErrors?.current ? "input-error" : ""}`} />
        {state.fieldErrors?.current && <p className="field-error">{state.fieldErrors.current}</p>}
      </div>
      <div>
        <label className="label">New password</label>
        <input name="next" type="password" required minLength={8} autoComplete="new-password" className="input" />
        <p className="field-hint">At least 8 characters.</p>
      </div>
      <div>
        <label className="label">Confirm new password</label>
        <input name="confirm" type="password" required autoComplete="new-password" className="input" />
      </div>
      <SubmitButton pendingLabel="Updating…">Change password</SubmitButton>
    </form>
  );
}
