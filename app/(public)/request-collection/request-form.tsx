"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmitButton, useToast } from "@/components/ui";
import { WASTE_CATEGORIES, CATEGORY_LABELS, UNITS, LOCALITIES } from "@/lib/domain";
import { CheckCircle2, Copy, ArrowRight, ShieldCheck, Info, ClipboardCheck } from "lucide-react";

type Mode = "form" | "confirmation";

export function RequestForm() {
  const { push } = useToast();
  const [mode, setMode] = useState<Mode>("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refCode, setRefCode] = useState("");
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const form = e.currentTarget;
    const fd = new FormData(form);

    const res = await fetch("/api/requests", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));

    if (res.status === 201) {
      setRefCode(data.referenceCode);
      setMode("confirmation");
      push("success", "Request submitted!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (res.status === 429) {
      push("error", data.error ?? "Too many submissions. Please wait a few minutes.");
    } else {
      if (data.fieldErrors) setErrors(data.fieldErrors);
      push("error", data.error ?? "Submission failed — check the highlighted fields.");
    }
  }

  async function copyRef() {
    try {
      await navigator.clipboard?.writeText(refCode);
      setCopied(true);
      push("success", "Reference code copied.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable (older browser / denied permission) — the code is on screen.
      push("info", "Select the code and copy it manually.");
    }
  }

  if (mode === "confirmation") {
    return (
      <div className="text-center py-6 animate-scale-in" role="status" aria-live="polite">
        <div className="w-16 h-16 rounded-full bg-leaf-100 border border-leaf-300 flex items-center justify-center mx-auto animate-pop-in">
          <ClipboardCheck className="w-8 h-8 text-leaf-700" />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal mt-5">Request received</h2>
        <p className="text-sm text-charcoal-soft mt-2.5 max-w-md mx-auto leading-relaxed">
          Our team reviews every request before confirming a slot, so this is not an appointment yet.
        </p>

        {/* The reference code is the single most important thing on this screen. */}
        <div className="mt-7 rounded-2xl border-2 border-forest-200 bg-forest-50/70 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">Your reference code</p>
          <p className="font-display text-3xl sm:text-4xl font-semibold tracking-[0.12em] text-forest-900 mt-2.5 break-all">
            {refCode}
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 mt-5">
            <button onClick={copyRef} className="btn btn-primary btn-sm">
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy code"}
            </button>
            <Link href={`/track-request?code=${encodeURIComponent(refCode)}`} className="btn btn-secondary btn-sm">
              Track this request <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-xs text-forest-800/80 mt-4 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Save this reference number to track your request.
          </p>
        </div>

        <div className="text-left max-w-md mx-auto mt-7 rounded-xl border border-sage-200 bg-sage-50/70 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal-soft/80">What happens next</p>
          <ol className="mt-2.5 space-y-1.5 text-sm text-charcoal-soft">
            <li>1. A coordinator reviews your request.</li>
            <li>2. You get a status update you can follow with your reference code.</li>
            <li>3. Approved requests are given a collection date.</li>
            <li>4. Collected waste is weighed and recorded — only verified records count publicly.</li>
          </ol>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-7">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setMode("form");
              setRefCode("");
              setErrors({});
            }}
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-9" noValidate>
      {/* ------------------------------------------------------ contact details */}
      <fieldset>
        <legend className="font-display text-lg font-semibold text-charcoal mb-1 w-full">
          1 · Contact details
        </legend>
        <p className="text-xs text-charcoal-soft/80 mb-4 pb-3 border-b border-sage-200">
          Used only to confirm the collection — never shown on public pages.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="r-name" className="label">Full name *</label>
            <input id="r-name" name="name" className={`input ${errors.name ? "input-error" : ""}`} placeholder="e.g. A. resident of Vasai-West" required autoComplete="name" />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="r-email" className="label">Email</label>
            <input id="r-email" name="email" type="email" className={`input ${errors.email ? "input-error" : ""}`} placeholder="you@example.com" autoComplete="email" />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="r-phone" className="label">Phone</label>
            <input id="r-phone" name="phone" type="tel" className={`input ${errors.phone ? "input-error" : ""}`} placeholder="+91 98XXX XXXXX" autoComplete="tel" />
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>
          <p className="sm:col-span-2 text-xs text-charcoal-soft/80 -mt-1">
            Provide at least one valid contact — email or phone — so we can confirm the collection.
          </p>
        </div>
      </fieldset>

      {/* --------------------------------------------------------------- location */}
      <fieldset>
        <legend className="font-display text-lg font-semibold text-charcoal mb-1 w-full">
          2 · Location
        </legend>
        <p className="text-xs text-charcoal-soft/80 mb-4 pb-3 border-b border-sage-200">
          The approximate area is enough to start; the detailed address stays private.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="r-locality" className="label">Locality / area *</label>
            <input id="r-locality" name="locality" className={`input ${errors.locality ? "input-error" : ""}`} list="locality-list" placeholder="e.g. Bhabola" required />
            <datalist id="locality-list">
              {LOCALITIES.map((l) => <option key={l} value={l} />)}
            </datalist>
            {errors.locality && <p className="field-error">{errors.locality}</p>}
            <p className="field-hint">Choose from the list or type your area in Vasai-West.</p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="r-address" className="label">Detailed address (optional · private)</label>
            <textarea
              id="r-address"
              name="address"
              className="input min-h-[4.5rem]"
              placeholder="Building / lane / landmark — visible to staff only, never published."
            />
            <p className="field-hint">Private: staff-only, excluded from all public pages and APIs.</p>
          </div>
        </div>
      </fieldset>

      {/* ---------------------------------------------------------- waste details */}
      <fieldset>
        <legend className="font-display text-lg font-semibold text-charcoal mb-1 w-full">
          3 · Waste details
        </legend>
        <p className="text-xs text-charcoal-soft/80 mb-4 pb-3 border-b border-sage-200">
          Approximate details are fine — the team confirms the final weight at pickup.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="r-category" className="label">Waste category *</label>
            <select id="r-category" name="category" className={`input ${errors.category ? "input-error" : ""}`} required defaultValue="">
              <option value="" disabled>Choose a category…</option>
              {WASTE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
            {errors.category && <p className="field-error">{errors.category}</p>}
          </div>
          <div>
            <label htmlFor="r-quantity" className="label">Approximate quantity (optional)</label>
            <div className="flex gap-2">
              <input id="r-quantity" name="quantity" type="number" min="0" step="0.1" className={`input ${errors.quantity ? "input-error" : ""}`} placeholder="e.g. 5" />
              <select name="unit" className="input w-28" defaultValue="kg" aria-label="Unit">
                {UNITS.map((u) => <option key={u} value={u}>{u === "other" ? "Other" : u}</option>)}
              </select>
            </div>
            {errors.quantity && <p className="field-error">{errors.quantity}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="r-description" className="label">Describe the waste *</label>
            <textarea
              id="r-description"
              name="description"
              className={`input ${errors.description ? "input-error" : ""}`}
              placeholder="e.g. Around 3 bags of clean dry plastic packaging, sorted and bagged…"
              required
            />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>
        </div>
      </fieldset>

      {/* --------------------------------------------------- preferred collection */}
      <fieldset>
        <legend className="font-display text-lg font-semibold text-charcoal mb-1 w-full">
          4 · Preferred collection
        </legend>
        <p className="text-xs text-charcoal-soft/80 mb-4 pb-3 border-b border-sage-200">
          Optional — the team confirms the final slot with you.
        </p>
        <div className="sm:max-w-xs">
          <label htmlFor="r-date" className="label">Preferred date</label>
          <input id="r-date" name="preferredDate" type="date" className={`input ${errors.preferredDate ? "input-error" : ""}`} />
          {errors.preferredDate && <p className="field-error">{errors.preferredDate}</p>}
          <p className="field-hint">Cannot be in the past.</p>
        </div>
      </fieldset>

      {/* -------------------------------------------------- additional information */}
      <fieldset>
        <legend className="font-display text-lg font-semibold text-charcoal mb-1 w-full">
          5 · Additional information
        </legend>
        <p className="text-xs text-charcoal-soft/80 mb-4 pb-3 border-b border-sage-200">
          A photo helps the team plan the pickup — it is entirely optional.
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="r-photo" className="label">Photo of the waste (optional)</label>
            <input
              id="r-photo"
              name="photo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="input file:mr-3 file:rounded-full file:border-0 file:bg-forest-50 file:px-3.5 file:py-1.5 file:text-sm file:font-medium file:text-forest-800 hover:file:bg-forest-100"
            />
            <p className="field-hint">JPG, PNG or WebP · up to 5 MB. Don&apos;t include people or private info in the photo.</p>
            {errors.photo && <p className="field-error">{errors.photo}</p>}
          </div>

          <div className={`rounded-xl border p-4 ${errors.consent ? "border-red-300 bg-red-50/50" : "border-sage-200 bg-sage-50/70"}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="consent" value="true" className="mt-1 w-4.5 h-4.5 accent-forest-700" />
              <span className="text-sm text-charcoal-soft leading-relaxed">
                I understand this is a <strong className="text-charcoal">request, not a confirmed appointment</strong>. The
                team will review it and contact me to confirm. I agree that submitted details may be used to organise
                this collection.
              </span>
            </label>
            {errors.consent && <p className="field-error mt-2">{errors.consent}</p>}
          </div>
        </div>
      </fieldset>

      <div className="pt-1">
        <div className="flex flex-col sm:flex-row gap-3">
          <SubmitButton className="flex-1" pendingLabel="Submitting…">Submit collection request</SubmitButton>
          <button
            type="reset"
            className="btn btn-secondary"
            onClick={() => setErrors({})}
          >
            Clear form
          </button>
        </div>
        <p className="text-xs text-charcoal-soft/80 mt-4 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-forest-600" />
          <span>
            You&apos;ll get a <strong className="text-charcoal">reference code</strong> straight away. Keep it — it is how
            you follow your request.{" "}
            <Link href="/track-request" className="text-forest-700 underline underline-offset-2">Already submitted? Track it here</Link>.
          </span>
        </p>
      </div>
    </form>
  );
}
