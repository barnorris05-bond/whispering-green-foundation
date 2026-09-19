"use client";

import { useState } from "react";
import { setMessageStatus, deleteMessage } from "@/app/admin/actions";
import { useToast, ConfirmDialog } from "@/components/ui";
import { MailOpen, Archive, Trash2, Mail } from "lucide-react";

export function MessageActions({ id, status }: { id: string; status: string }) {
  const { push } = useToast();
  const [confirm, setConfirm] = useState(false);

  async function set(status: string) {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", status);
    const res = await setMessageStatus({ ok: false }, fd);
    if (res.ok) push("success", res.message ?? "Updated.");
    else push("error", res.error ?? "Failed.");
  }

  async function remove() {
    const fd = new FormData();
    fd.set("id", id);
    const res = await deleteMessage({ ok: false }, fd);
    if (res.ok) push("success", res.message ?? "Deleted.");
    else push("error", res.error ?? "Failed.");
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {status !== "read" && (
        <button onClick={() => set("read")} className="btn btn-ghost btn-sm" title="Mark read"><MailOpen className="w-4 h-4" /></button>
      )}
      {status !== "new" && (
        <button onClick={() => set("new")} className="btn btn-ghost btn-sm" title="Mark unread"><Mail className="w-4 h-4" /></button>
      )}
      {status !== "archived" && (
        <button onClick={() => set("archived")} className="btn btn-ghost btn-sm" title="Archive"><Archive className="w-4 h-4" /></button>
      )}
      <button onClick={() => setConfirm(true)} className="btn btn-ghost btn-sm text-red-700 hover:bg-red-50" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
      <ConfirmDialog
        open={confirm}
        destructive
        title="Delete this message?"
        body="This permanently removes the message."
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setConfirm(false)}
      />
    </div>
  );
}
