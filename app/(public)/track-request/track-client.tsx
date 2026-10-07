"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmitButton, useToast, Badge, STATUS_TONES } from "@/components/ui";
import { STATUS_LABELS, PUBLIC_STATUS_LABELS } from "@/lib/domain";
import { formatDate, formatDateTime, formatDateOnly } from "@/lib/format";
import {
  Search, CheckCircle2, CircleDashed, ShieldQuestion, PackageSearch, History, Lock, CalendarCheck, Clock,
} from "lucide-react";

interface TimelineEntry {
  at: string;
  label: string;
  note?: string | null;
}

interface TrackResult {
  referenceCode: string;
  status: string;
  createdAt: string;
  category: string;
  locality: string;
  quantity: string | null;
  scheduledDate?: string | null;
  updates: TimelineEntry[];
  completedAt?: string | null;
}

const FLOW = ["submitted", "under_review", "approved", "scheduled", "in_progress", "completed"] as const;

const TERMINAL = new Set(["rejected", "cancelled"]);

export function TrackClient({ initialCode }: { initialCode?: string }) {
  const { push } = useToast();
  const [result, setResult] = useState<TrackResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setResult(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/requests/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referenceCode: fd.get("referenceCode"), contact: fd.get("contact") }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      setResult(data.request);
    } else if (res.status === 404) {
      setNotFound(true);
    } else {
      push("error", data.error ?? "Tracking failed.");
    }
  }

  const currentIdx = result ? FLOW.indexOf(result.status as (typeof FLOW)[number]) : -1;

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="card p-7 space-y-4">
        <div>
          <label htmlFor="t-code" className="label">Reference code</label>
          <input
            id="t-code"
            name="referenceCode"
            defaultValue={initialCode}
            placeholder="WGF-XXXX-XXXX"
            className="input font-mono tracking-widest uppercase"
            required
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="t-contact" className="label">Your email or phone</label>
          <input id="t-contact" name="contact" className="input" placeholder="Used to verify it's your request" required autoComplete="email" />
          <p className="field-hint flex items-center gap-1.5 mt-1.5">
            <Lock className="w-3 h-3" /> Both must match — a guessed code alone reveals nothing private.
          </p>
        </div>
        <SubmitButton className="w-full" pendingLabel="Checking…">
          <Search className="w-4 h-4" /> Track request
        </SubmitButton>
      </form>

      {notFound && (
        <div className="card p-7 text-center border-amber-200 bg-amber-50/60 animate-scale-in">
          <ShieldQuestion className="w-10 h-10 text-amber-600 mx-auto" />
          <h2 className="font-display text-lg font-semibold text-charcoal mt-3">No matching request found</h2>
          <p className="text-sm text-charcoal-soft mt-2 max-w-sm mx-auto">
            Double-check the reference code and the contact you originally provided. Codes are case-insensitive but
            must exactly match our records together with your contact.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-5 animate-fade-in">
          <div className="card p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-charcoal-soft/70">Reference</p>
                <p className="font-display text-2xl font-semibold text-forest-800 tracking-[0.1em]">{result.referenceCode}</p>
              </div>
              <Badge tone={STATUS_TONES[result.status] ?? "gray"}>
                {PUBLIC_STATUS_LABELS[result.status] ?? STATUS_LABELS[result.status]}
              </Badge>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-sage-200 text-sm">
              <div><dt className="text-xs text-charcoal-soft/70">Submitted</dt><dd className="font-medium mt-0.5">{formatDate(result.createdAt)}</dd></div>
              <div><dt className="text-xs text-charcoal-soft/70">Category</dt><dd className="font-medium mt-0.5 capitalize">{result.category.replace(/_/g, " ")}</dd></div>
              <div><dt className="text-xs text-charcoal-soft/70">Area</dt><dd className="font-medium mt-0.5">{result.locality}</dd></div>
              <div><dt className="text-xs text-charcoal-soft/70">Quantity</dt><dd className="font-medium mt-0.5">{result.quantity ?? "—"}</dd></div>
            </dl>

            {result.scheduledDate && (
              <p className="mt-5 flex items-center gap-2 text-sm font-medium text-forest-800 bg-leaf-100/50 border border-leaf-200 rounded-xl px-4 py-3">
                <CalendarCheck className="w-4.5 h-4.5 text-forest-600 shrink-0" />
                Collection scheduled for {formatDateOnly(result.scheduledDate)} — please keep the waste accessible.
              </p>
            )}

            {/* Only the stages that apply to this request are marked as reached. */}
            {!TERMINAL.has(result.status) && (
              <div className="mt-7">
                <ol className="flex items-start" aria-label="Request progress">
                  {FLOW.map((s, i) => {
                    const done = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    return (
                      <li key={s} className="flex-1 flex items-center last:flex-none" aria-current={isCurrent ? "step" : undefined}>
                        <span className="flex flex-col items-center gap-1.5">
                          {done ? (
                            <CheckCircle2
                              className={`w-6 h-6 animate-pop-in ${isCurrent ? "text-leaf-600" : "text-forest-600"}`}
                              style={{ animationDelay: `${i * 70}ms` }}
                              aria-hidden
                            />
                          ) : (
                            <CircleDashed className="w-6 h-6 text-sage-300" aria-hidden />
                          )}
                          <span className={`text-[0.62rem] sm:text-[0.68rem] text-center ${done ? "text-forest-800 font-medium" : "text-charcoal-soft/55"}`}>
                            {STATUS_LABELS[s]}
                          </span>
                        </span>
                        {i < FLOW.length - 1 && (
                          <span aria-hidden className={`h-0.5 flex-1 mx-1 rounded ${i < currentIdx ? "bg-forest-500" : "bg-sage-200"}`} />
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {TERMINAL.has(result.status) && (
              <p className="text-sm text-charcoal-soft bg-sage-50 border border-sage-200 rounded-xl px-4 py-3 mt-6">
                This request is {result.status}. Check the latest update below for context.
              </p>
            )}
          </div>

          <div className="card p-7">
            <h2 className="font-display text-lg font-semibold text-charcoal flex items-center gap-2 mb-5">
              <History className="w-5 h-5 text-forest-600" /> Updates
            </h2>
            {result.updates.length === 0 ? (
              <p className="text-sm text-charcoal-soft flex items-center gap-2">
                <Clock className="w-4 h-4 text-charcoal-soft/70" /> No updates yet — your request is in the queue.
              </p>
            ) : (
              <ol className="relative border-l-2 border-forest-100 ml-2 space-y-6">
                {result.updates.map((u, i) => (
                  <li
                    key={`${u.at}-${i}`}
                    className="pl-6 relative animate-fade-in"
                    style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
                  >
                    <span aria-hidden className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-leaf-400 border-2 border-white shadow-soft" />
                    <p className="text-sm font-medium text-charcoal">{u.label}</p>
                    {u.note && <p className="text-sm text-charcoal-soft mt-1 leading-relaxed">{u.note}</p>}
                    <p className="text-xs text-charcoal-soft/65 mt-1">{formatDateTime(u.at)}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="card p-7 space-y-3" aria-hidden>
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      )}

      <p className="text-xs text-charcoal-soft/70 flex items-center gap-1.5 justify-center pt-2">
        <PackageSearch className="w-3.5 h-3.5" /> Lost your code?{" "}
        <Link href="/contact" className="text-forest-700 underline underline-offset-2">Contact us</Link> with your details.
      </p>
    </div>
  );
}
