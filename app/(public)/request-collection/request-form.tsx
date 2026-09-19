"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SubmitButton, useToast, Badge } from "@/components/ui";
import { WASTE_CATEGORIES, CATEGORY_LABELS, UNITS, LOCALITIES } from "@/lib/domain";
import { CheckCircle2, PartyPopper, Copy, ArrowRight } from "lucide-react";

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

  function copyRef() {
    navigator.clipboard?.writeText(refCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  if (mode === "confirmation") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="text-center py-8"
        role="status"
      >
        <div className="w-16 h-16 rounded-full bg-leaf-100 border border-leaf-300 flex items-center justify-center mx-auto">
          <PartyPopper className="w-7 h-7 text-leaf-700" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-charcoal mt-5">Request submitted!</h2>
        <p className="text-sm text-charcoal-soft mt-2 max-w-md mx-auto">
          Keep this reference code — it&apos;s the only way to track your request along with the contact you provided.
        </p>
        <div className="glass rounded-2xl px-6 py-5 mt-6 inline-flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-[0.18em] text-charcoal-soft/70">Reference code</span>
          <span className="font-display text-3xl font-semibold tracking-[0.12em] text-forest-800">{refCode}</span>
          <button onClick={copyRef} className="btn btn-secondary btn-sm mt-1.5">
            <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy code"}
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link href={`/track-request?code=${encodeURIComponent(refCode)}`} className="btn btn-primary">
            Track this request <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setMode("form");
              setRefCode("");
            }}
          >
            Submit another request
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {/* section: who */}
      <fieldset>
        <legend className="font-display text-lg font-semibold text-charcoal mb-4 pb-2 border-b border-sage-200 w-full">
          1 · About you
        </legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="r-name" className="label">Full name *</label>
            <input id="r-name" name="name" className={`input ${errors.name ? "input-error" : ""}`} placeholder="e.g. A. resident of Vasai-West" required />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="r-email" className="label">Email</label>
            <input id="r-email" name="email" type="email" className={`input ${errors.email ? "input-error" : ""}`} placeholder="you@example.com" />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="r-phone" className="label">Phone</label>
            <input id="r-phone" name="phone" type="tel" className={`input ${errors.phone ? "input-error" : ""}`} placeholder="+91 98XXX XXXXX" />
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>
          <p className="sm:col-span-2 text-xs text-charcoal-soft/80 -mt-1">
            Provide at least one valid contact — email or phone — so we can confirm the collection.
          </p>
        </div>
      </fieldset>

      {/* section: waste */}
      <fieldset>
        <legend className="font-display text-lg font-semibold text-charcoal mb-4 pb-2 border-b border-sage-200 w-full">
          2 · The waste
        </legend>
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

      {/* section: where & when */}
      <fieldset>
        <legend className="font-display text-lg font-semibold text-charcoal mb-4 pb-2 border-b border-sage-200 w-full">
          3 · Where &amp; when
        </legend>
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
          <div>
            <label htmlFor="r-date" className="label">Preferred date (optional)</label>
            <input id="r-date" name="preferredDate" type="date" className={`input ${errors.preferredDate ? "input-error" : ""}`} />
            {errors.preferredDate && <p className="field-error">{errors.preferredDate}</p>}
            <p className="field-hint">Cannot be in the past. Final slot is confirmed by our team.</p>
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

      {/* section: photo & consent */}
      <fieldset>
        <legend className="font-display text-lg font-semibold text-charcoal mb-4 pb-2 border-b border-sage-200 w-full">
          4 · Photo &amp; confirmation
        </legend>
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

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <SubmitButton className="flex-1" pendingLabel="Submitting…">Submit collection request</SubmitButton>
        <button type="reset" className="btn btn-secondary">Clear form</button>
      </div>
    </form>
  );
}
