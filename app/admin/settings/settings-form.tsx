"use client";

import { useActionState, useEffect } from "react";
import { updateSettings } from "@/app/admin/actions";
import { SubmitButton, useToast } from "@/components/ui";

type State = { ok: boolean; error?: string; message?: string; fieldErrors?: Record<string, string> };

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const { push } = useToast();
  const [state, action] = useActionState<State, FormData>(async (prev, fd) => {
    const res = await updateSettings(prev, fd);
    return res;
  }, { ok: false });

  useEffect(() => {
    if (state.message) push("success", state.message);
    if (state.error) push("error", state.error);
  }, [state]);

  return (
    <form action={action} className="card p-7 space-y-4">
      <h3 className="font-display text-lg font-semibold text-charcoal">Public organisation info</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Display name *</label>
          <input name="displayName" required defaultValue={settings.displayName} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Tagline</label>
          <input name="tagline" defaultValue={settings.tagline} className="input" placeholder="One line shown under the name" />
        </div>
        <div>
          <label className="label">Contact email</label>
          <input name="contactEmail" type="email" defaultValue={settings.contactEmail} className="input" placeholder="hello@…" />
        </div>
        <div>
          <label className="label">Contact phone</label>
          <input name="contactPhone" defaultValue={settings.contactPhone} className="input" placeholder="+91 …" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Public location</label>
          <input name="publicLocation" defaultValue={settings.publicLocation} className="input" placeholder="e.g. Vasai-West, Palghar, Maharashtra" />
        </div>
        <div>
          <label className="label">Facebook URL</label>
          <input name="socialFacebook" type="url" defaultValue={settings.socialFacebook} className="input" placeholder="https://…" />
        </div>
        <div>
          <label className="label">Instagram URL</label>
          <input name="socialInstagram" type="url" defaultValue={settings.socialInstagram} className="input" placeholder="https://…" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Footer note</label>
          <textarea name="footerNote" defaultValue={settings.footerNote} className="input min-h-[4rem]" placeholder="Short paragraph shown in the public footer" />
        </div>
      </div>
      {state.error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{state.error}</p>
      )}
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">Save settings</SubmitButton>
      </div>
    </form>
  );
}
