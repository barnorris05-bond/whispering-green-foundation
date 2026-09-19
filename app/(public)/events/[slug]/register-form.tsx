"use client";

import { useState } from "react";
import { SubmitButton, useToast } from "@/components/ui";

export function EventRegisterForm({ eventId }: { eventId: string }) {
  const { push } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/events/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setDone(true);
      push("success", "Registration confirmed — see you there!");
    } else {
      if (data.fieldErrors) setErrors(data.fieldErrors);
      push("error", data.error ?? "Registration failed. Please check the form.");
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-leaf-300 bg-leaf-100/60 px-4 py-5 text-center animate-scale-in">
        <p className="font-semibold text-forest-800">You&apos;re registered! 🌿</p>
        <p className="text-sm text-charcoal-soft mt-1">We&apos;ve saved your spot. Reach out on the event day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3.5" noValidate>
      <div>
        <label htmlFor="v-name" className="label">Full name *</label>
        <input id="v-name" name="name" className={`input ${errors.name ? "input-error" : ""}`} placeholder="Your name" required />
        {errors.name && <p className="field-error">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="v-email" className="label">Email *</label>
        <input id="v-email" name="email" type="email" className={`input ${errors.email ? "input-error" : ""}`} placeholder="you@example.com" required />
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="v-phone" className="label">Phone (optional)</label>
        <input id="v-phone" name="phone" type="tel" className="input" placeholder="+91…" />
      </div>
      <SubmitButton className="w-full" pendingLabel="Registering…">Register as volunteer</SubmitButton>
    </form>
  );
}
