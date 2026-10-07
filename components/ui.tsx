"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertTriangle, Info, X, Loader2, Inbox } from "lucide-react";
import { cn } from "@/lib/format";

/* ------------------------------------------------------------------ badges */

const badgeTones: Record<string, string> = {
  green: "bg-forest-50 text-forest-800 border-forest-200",
  leaf: "bg-leaf-100 text-leaf-700 border-leaf-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  gray: "bg-sage-100 text-charcoal-soft border-sage-300",
  blue: "bg-sky-50 text-sky-800 border-sky-200",
  demo: "bg-clay/60 text-bark border-clay",
};

export function Badge({ tone = "gray", children, className }: { tone?: keyof typeof badgeTones; children: ReactNode; className?: string }) {
  return <span className={cn("badge", badgeTones[tone], className)}>{children}</span>;
}

export const STATUS_TONES: Record<string, keyof typeof badgeTones> = {
  submitted: "blue",
  under_review: "amber",
  approved: "green",
  scheduled: "green",
  in_progress: "leaf",
  completed: "leaf",
  rejected: "red",
  cancelled: "gray",
  draft: "gray",
  verified: "leaf",
  published: "leaf",
  active: "leaf",
  archived: "gray",
  new: "blue",
  read: "gray",
  confirmed: "leaf",
  estimated: "amber",
  measured: "green",
};

/* ------------------------------------------------------------------ toasts */

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; text: string; leaving?: boolean };
const ToastCtx = createContext<{ push: (kind: ToastKind, text: string) => void }>({ push: () => {} });

/**
 * Toasts use CSS keyframes for the entrance and a `data-leaving` transition for
 * the exit, so the toast system ships no animation library to every page.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
      setTimeout(() => remove(id), 240);
    },
    [remove]
  );

  const push = useCallback(
    (kind: ToastKind, text: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, kind, text }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div aria-live="polite" aria-atomic="false" className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            data-leaving={t.leaving ? "true" : undefined}
            className={cn(
              "toast flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lift backdrop-blur-md",
              t.kind === "success" && "bg-white/95 border-leaf-300 text-forest-800",
              t.kind === "error" && "bg-white/95 border-red-300 text-red-800",
              t.kind === "info" && "bg-white/95 border-sage-300 text-charcoal"
            )}
          >
            {t.kind === "success" ? <CheckCircle2 className="w-4.5 h-4.5 text-leaf-600 shrink-0 mt-0.5" /> :
              t.kind === "error" ? <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" /> :
                <Info className="w-4.5 h-4.5 text-forest-600 shrink-0 mt-0.5" />}
            <span>{t.text}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="ml-auto -mr-1 -mt-0.5 p-1 rounded-md text-charcoal-soft/50 hover:text-charcoal hover:bg-sage-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}

/* ----------------------------------------------------------- submit button */

export function SubmitButton({ children, className, pendingLabel, onClick }: { children: ReactNode; className?: string; pendingLabel?: string; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} onClick={onClick} className={cn("btn btn-primary", className)} aria-busy={pending}>
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" /> {pendingLabel ?? "Working…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/* ------------------------------------------------------------- empty state */

export function EmptyState({ icon, title, hint, action }: { icon?: ReactNode; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-[var(--radius-card)] border border-dashed border-sage-300 bg-sage-50/60">
      <div className="w-12 h-12 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-500 mb-3">
        {icon ?? <Inbox className="w-5 h-5" />}
      </div>
      <p className="font-medium text-charcoal">{title}</p>
      {hint && <p className="text-sm text-charcoal-soft/85 mt-1 max-w-sm">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* --------------------------------------------------------- confirm dialog */

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  destructive,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const ref = useFocusOnOpen(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-forest-950/45 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div ref={ref} className="relative bg-white rounded-2xl border border-sage-200 shadow-lift w-full max-w-md p-6 animate-scale-in">
        <h3 className="font-display text-lg font-semibold text-charcoal">{title}</h3>
        <p className="text-sm text-charcoal-soft mt-2 leading-relaxed">{body}</p>
        <div className="flex justify-end gap-2.5 mt-6">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button
            className={cn("btn btn-sm", destructive ? "bg-red-600 text-white hover:bg-red-700" : "btn-primary")}
            autoFocus
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Focus the first control when a panel opens, and restore focus when it closes. */
function useFocusOnOpen(active: boolean) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!active || !node) return;
    const prev = document.activeElement as HTMLElement | null;
    node.querySelector<HTMLElement>("[data-autofocus],button")?.focus();
    return () => prev?.focus?.();
  }, [active, node]);
  return setNode;
}

/* ------------------------------------------------------------- breadcrumbs */

export function Breadcrumbs({ items }: { items: Array<{ href?: string; label: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-charcoal-soft/80">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden className="text-sage-300">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-forest-700 transition-colors rounded px-0.5">{item.label}</Link>
            ) : (
              <span aria-current="page" className="text-charcoal font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* --------------------------------------------------------- reveal wrapper */

/**
 * Scroll reveal with progressive enhancement — no animation library.
 *
 * Content is visible by default in the server-rendered HTML. Only after mount,
 * and only for elements that start below the fold, does this component add the
 * "hidden" state and hand the reveal over to an IntersectionObserver. So:
 *  - Above-the-fold content (the hero, the LCP element) never animates or waits.
 *  - If JavaScript never runs, every section is still fully visible and readable.
 *  - `prefers-reduced-motion` skips the observer entirely.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  id,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setState("shown");
      return;
    }
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      setState("shown");
      return;
    }
    setState("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -48px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={cn("reveal", className)}
      data-reveal={state === "idle" ? undefined : state}
      style={delay ? ({ "--reveal-delay": `${Math.round(delay * 1000)}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------- section heading */

export function SectionHeading({ eyebrow, title, sub, center }: { eyebrow?: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={cn("mb-10", center && "text-center mx-auto max-w-2xl")}>
      {eyebrow && (
        <span className="inline-block text-xs font-semibold tracking-[0.14em] uppercase text-forest-600 bg-forest-50 border border-forest-100 rounded-full px-3 py-1 mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal tracking-tight">{title}</h2>
      {sub && <p className="text-charcoal-soft mt-3 leading-relaxed">{sub}</p>}
    </div>
  );
}
