import Link from "next/link";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <LogoMark className="w-16 h-16 mx-auto rounded-2xl shadow-soft" />
        <p className="font-display text-7xl font-semibold text-forest-800 mt-6">404</p>
        <h1 className="font-display text-2xl font-semibold text-charcoal mt-2">This page wandered off the trail</h1>
        <p className="text-charcoal-soft mt-3 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist, was unpublished, or was moved.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link href="/" className="btn btn-primary">Back to home</Link>
          <Link href="/contact" className="btn btn-secondary">Contact us</Link>
        </div>
      </div>
    </div>
  );
}
