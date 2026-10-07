"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/format";

/**
 * Copy-to-clipboard button used by the donation page's bank details.
 *
 * - Copies the exact `value` (the on-page display may include spaces; the
 *   clipboard value never does).
 * - Falls back to an off-screen textarea + `execCommand("copy")` when the
 *   async Clipboard API is unavailable or rejected (older browsers,
 *   permission denials, non-secure contexts).
 * - Announces success via a polite live region and swaps its own label to
 *   "Copied" — deliberately no toast, so the page stays calm.
 * - On failure the bank details remain fully visible and a short
 *   manual-copy instruction is shown instead of an error dialog.
 */
export function CopyButton({
  value,
  ariaLabel,
  announce,
  fallback,
  className,
}: {
  value: string;
  ariaLabel: string;
  announce: string;
  fallback: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timerRef = useRef<number | null>(null);
  const liveRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const scheduleReset = (ms: number) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, ms);
  };

  const copy = async () => {
    let ok = false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      // Legacy fallback: select off-screen text and issue a synthetic copy.
      try {
        const helper = document.createElement("textarea");
        helper.value = value;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        ok = document.execCommand("copy");
        document.body.removeChild(helper);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      setFailed(false);
      scheduleReset(2400);
    } else {
      setCopied(false);
      setFailed(true);
      scheduleReset(6000);
    }
    // Clear first, then set, so copying the same field twice in a row still
    // produces a live-region mutation for screen readers to re-announce.
    const message = ok ? announce : fallback;
    if (liveRef.current) {
      liveRef.current.textContent = "";
      window.setTimeout(() => {
        if (liveRef.current) liveRef.current.textContent = message;
      }, 40);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={ariaLabel}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
          copied
            ? "border-leaf-300 bg-leaf-100 text-leaf-700"
            : "border-forest-200 bg-forest-50 text-forest-700 hover:border-forest-300 hover:bg-forest-100",
          className
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
        <span className={copied ? "animate-fade-in" : undefined}>{copied ? "Copied" : "Copy"}</span>
      </button>
      <span ref={liveRef} role="status" aria-live="polite" className="sr-only" />
      {failed && (
        <span className="block w-full basis-full text-xs text-red-700">{fallback}</span>
      )}
    </>
  );
}
