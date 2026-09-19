import type { Metadata } from "next";
import { Suspense } from "react";
import { Reveal } from "@/components/ui";
import { LoginForm } from "./login-form";
import { LeafMark } from "@/components/logo";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Staff Login",
  description: "Sign in to the Whispering Green Foundation staff dashboard.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ivory">
      <div className="flex items-center justify-center px-6 py-16">
        <Reveal className="w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-8">
            <LeafMark className="w-9 h-9 text-forest-800" />
            <span className="font-display font-semibold text-forest-900 text-lg">Whispering Green Foundation</span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-forest-950 tracking-tight">Staff sign-in</h1>
          <p className="text-sm text-charcoal-soft mt-2.5 mb-8">
            For foundation staff and volunteers coordinating collections and events.
          </p>
          <Suspense fallback={<div className="skeleton h-72 rounded-2xl" />}>
            <LoginForm />
          </Suspense>
          <p className="text-xs text-charcoal-soft/70 mt-6 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Sessions are httpOnly cookies backed by server-side records.
          </p>
        </Reveal>
      </div>
      <div className="hidden lg:block relative bg-forest-900 overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950" />
        <svg aria-hidden viewBox="0 0 400 600" className="absolute inset-0 w-full h-full opacity-[0.13]" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 26 }).map((_, i) => (
            <path
              key={i}
              d="M0 -14C7 -7 7 7 0 14C-7 7 -7 -7 0 -14Z"
              transform={`translate(${(i * 71) % 400} ${(i * 137) % 600}) rotate(${(i * 53) % 360})`}
              fill="none"
              stroke="#a8d98b"
              strokeWidth="1.4"
            />
          ))}
        </svg>
        <div className="relative h-full flex flex-col justify-center px-14 text-forest-50">
          <p className="font-display text-3xl leading-snug max-w-sm">
            “Every verified kilogram is a promise kept to the neighbourhood.”
          </p>
          <p className="text-sm text-forest-300/85 mt-5">— Demo build · Whispering Green Foundation</p>
        </div>
      </div>
    </div>
  );
}
