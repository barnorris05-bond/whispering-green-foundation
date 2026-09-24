import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/format";
import logoFull from "@/public/brand/wgf-logo.png";
import logoMark from "@/public/brand/wgf-icon.png";

/**
 * Official Whispering Green Foundation logo (supplied brand asset).
 * - `Logo`     — full lockup: heart + leaves + heartbeat + wordmark (light backgrounds)
 * - `LogoOnDark` — full lockup on a white chip for dark surfaces (footer)
 * - `LogoMark` — square heart-and-leaves mark for compact spots
 * Aspect ratio is preserved; never stretch or recolour the asset.
 */

/** Image-only lockup — use inside your own link (never nest <a> in <a>). */
export function LogoImage({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src={logoFull}
      alt="Whispering Green Foundation logo"
      priority={priority}
      className={cn("h-10 w-auto sm:h-11", className)}
      sizes="160px"
    />
  );
}

export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center group shrink-0", className)}
      aria-label="Whispering Green Foundation — home"
    >
      <LogoImage
        priority={priority}
        className="transition-transform duration-300 group-hover:scale-[1.03]"
      />
    </Link>
  );
}

export function LogoOnDark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl bg-white px-3 py-1.5 shadow-soft",
        className
      )}
    >
      <Image
        src={logoFull}
        alt="Whispering Green Foundation logo"
        className="h-11 w-auto"
        sizes="176px"
      />
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src={logoMark}
      alt=""
      aria-hidden="true"
      className={cn("w-10 h-10 rounded-lg", className)}
      sizes="40px"
    />
  );
}
