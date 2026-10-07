/**
 * Canonical site origin, shared by page metadata, `robots.txt` and `sitemap.xml`.
 *
 * Resolution order:
 *   1. `NEXT_PUBLIC_SITE_URL` — set this once the site has a real domain.
 *   2. Vercel's own deployment origin, so hosted previews are correct by default.
 *   3. Nothing — locally we emit no absolute canonical/Open Graph URLs at all, so
 *      a build can never advertise `localhost` as its canonical address.
 */
const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");

/**
 * Vercel injects the deployment's own origin for us, so a hosted preview gets
 * correct canonical/OG/sitemap URLs without any manual configuration. Setting
 * `NEXT_PUBLIC_SITE_URL` always wins — use it once a custom domain exists.
 */
const vercelOrigin =
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined;

/** Absolute site origin, or `undefined` when none can be determined. */
export const SITE_URL: string | undefined = configured || vercelOrigin || undefined;

export const SITE_NAME = "Whispering Green Foundation";

export const SITE_TAGLINE = "Community-led waste collection and awareness in Vasai-West";

/**
 * Set only when a real origin is known, so Next.js never resolves social images
 * or canonical URLs against a guessed domain. When it is unset (local dev with no
 * env var) no absolute URLs are emitted at all.
 */
export const METADATA_BASE = SITE_URL ? new URL(SITE_URL) : undefined;

/** Build an absolute URL for the configured origin, or `undefined` if unset. */
export function absoluteUrl(path = "/"): string | undefined {
  if (!SITE_URL) return undefined;
  const suffix = path === "" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${suffix}`;
}
