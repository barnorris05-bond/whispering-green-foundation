"use client";

import { useState } from "react";
import { SubmitButton, useToast } from "@/components/ui";
import { AlertCircle } from "lucide-react";

export function ContactForm() {
  const { push } = useToast();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setFieldErrors({});
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        subject: fd.get("subject"),
        message: fd.get("message"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      push("success", "Message sent! Staff will see it in their dashboard.");
      form.reset();
    } else {
      if (data.fieldErrors) setFieldErrors(data.fieldErrors);
      push("error", data.error ?? "Could not send the message.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="c-name" className="label">Your name *</label>
          <input id="c-name" name="name" className={`input ${fieldErrors.name ? "input-error" : ""}`} placeholder="Full name" required aria-describedby={fieldErrors.name ? "c-name-err" : undefined} />
          {fieldErrors.name && <p id="c-name-err" className="field-error"><AlertCircle className="w-3 h-3" />{fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="c-email" className="label">Email</label>
          <input id="c-email" name="email" type="email" className={`input ${fieldErrors.email ? "input-error" : ""}`} placeholder="you@example.com" aria-describedby={fieldErrors.email ? "c-email-err" : undefined} />
          {fieldErrors.email && <p id="c-email-err" className="field-error"><AlertCircle className="w-3 h-3" />{fieldErrors.email}</p>}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="c-phone" className="label">Phone</label>
          <input id="c-phone" name="phone" type="tel" className="input" placeholder="+91…" />
        </div>
        <div>
          <label htmlFor="c-subject" className="label">Subject *</label>
          <input id="c-subject" name="subject" className={`input ${fieldErrors.subject ? "input-error" : ""}`} placeholder="What is this about?" required aria-describedby={fieldErrors.subject ? "c-subject-err" : undefined} />
          {fieldErrors.subject && <p id="c-subject-err" className="field-error"><AlertCircle className="w-3 h-3" />{fieldErrors.subject}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="label">Message *</label>
        <textarea id="c-message" name="message" className={`input ${fieldErrors.message ? "input-error" : ""}`} placeholder="Write your message…" required aria-describedby={fieldErrors.message ? "c-message-err" : undefined} />
        {fieldErrors.message && <p id="c-message-err" className="field-error"><AlertCircle className="w-3 h-3" />{fieldErrors.message}</p>}
      </div>
      <SubmitButton className="w-full sm:w-auto" pendingLabel="Sending…">Send message</SubmitButton>
    </form>
  );
}
