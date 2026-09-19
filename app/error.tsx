"use client";

import Link from "next/link";
import { LeafMark } from "@/components/logo";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <LeafMark className="w-14 h-14 text-forest-700 mx-auto" />
        <h1 className="font-display text-2xl font-semibold text-charcoal mt-6">Something went wrong</h1>
        <p className="text-charcoal-soft mt-3 leading-relaxed">
          An unexpected error occurred. Try again — if it persists, restart the dev server.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <button onClick={reset} className="btn btn-primary">Try again</button>
          <Link href="/" className="btn btn-secondary">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
