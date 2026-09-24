"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitButton, useToast } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { push } = useToast();
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      push("success", "Welcome back!");
      router.push(params.get("next") ?? "/admin");
      router.refresh();
    } else {
      setError(data.error ?? "Sign-in failed.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-7 space-y-4" noValidate={false}>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3" role="alert">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="l-email" className="label">Email</label>
        <input id="l-email" name="email" type="email" className="input" placeholder="founder@whisperinggreen.demo" autoComplete="username" required />
      </div>
      <div>
        <label htmlFor="l-pass" className="label">Password</label>
        <div className="relative">
          <input id="l-pass" name="password" type={show ? "text" : "password"} className="input pr-11" autoComplete="current-password" required />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-soft/60 hover:text-charcoal"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>
      <SubmitButton className="w-full" pendingLabel="Signing in…">Sign in</SubmitButton>
      {process.env.NODE_ENV !== "production" && (
        <div className="rounded-xl bg-parchment border border-clay px-4 py-3.5 text-xs leading-relaxed">
          <p className="font-semibold text-charcoal">Demo credentials (local dev only)</p>
          <p className="text-charcoal-soft mt-1">
            Founder: <code className="bg-white px-1.5 py-0.5 rounded border border-clay">founder@wgf.demo</code> / <code className="bg-white px-1.5 py-0.5 rounded border border-clay">Founder@123</code>
          </p>
          <p className="text-charcoal-soft mt-1">
            Staff: <code className="bg-white px-1.5 py-0.5 rounded border border-clay">staff@wgf.demo</code> / <code className="bg-white px-1.5 py-0.5 rounded border border-clay">Staff@123</code>
          </p>
          <p className="text-charcoal-soft/70 mt-1.5">Shown in development builds only — never in production.</p>
        </div>
      )}
    </form>
  );
}
