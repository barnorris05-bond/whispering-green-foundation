"use client";

import { useState } from "react";
import { setAttendance, deleteRegistration } from "@/app/admin/actions";
import { useToast, ConfirmDialog } from "@/components/ui";

export function AttendanceControls({ id, attendance }: { id: string; attendance: string }) {
  const { push } = useToast();
  const [confirm, setConfirm] = useState(false);

  async function change(v: string) {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("attendance", v);
    const res = await setAttendance({ ok: false }, fd);
    if (res.ok) push("success", res.message ?? "Updated.");
    else push("error", res.error ?? "Failed.");
  }

  async function remove() {
    const fd = new FormData();
    fd.set("id", id);
    const res = await deleteRegistration({ ok: false }, fd);
    if (res.ok) push("success", res.message ?? "Removed.");
    else push("error", res.error ?? "Failed.");
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="input btn-sm"
        defaultValue={attendance}
        onChange={(e) => change(e.target.value)}
        aria-label="Attendance"
      >
        <option value="">— not marked —</option>
        <option value="present">Present</option>
        <option value="absent">Absent</option>
      </select>
      <button className="btn btn-ghost btn-sm text-red-700 hover:bg-red-50" onClick={() => setConfirm(true)}>
        Remove
      </button>
      <ConfirmDialog
        open={confirm}
        destructive
        title="Remove this registration?"
        body="The volunteer will be unregistered. They can register again while the event is open."
        confirmLabel="Remove"
        onConfirm={remove}
        onClose={() => setConfirm(false)}
      />
    </div>
  );
}
