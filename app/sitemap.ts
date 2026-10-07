import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

const base = SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES: Array<[string, number]> = [
  ["", 1],
  ["/about", 0.8],
  ["/journey", 0.8],
  ["/donate", 0.9],
  ["/request-collection", 0.9],
  ["/initiatives", 0.7],
  ["/events", 0.7],
  ["/awareness", 0.7],
  ["/gallery", 0.6],
  ["/contact", 0.6],
  // `/login` and `/track-request` are deliberately excluded: they are noindex
  // (staff sign-in and resident-private workflows).
];

/**
 * Static routes plus published dynamic content. The database read is wrapped so
 * a transient outage degrades to the static list instead of breaking
 * `/sitemap.xml` entirely. Tracking and admin routes are intentionally absent
 * (they are disallowed in robots.txt).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(([path, priority]) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));

  try {
    const [projects, events, articles] = await Promise.all([
      prisma.project.findMany({
        where: { visibility: "published" },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 200,
      }),
      prisma.event.findMany({
        where: { status: { in: ["published", "completed"] } },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 200,
      }),
      prisma.content.findMany({
        // Founder-note content belongs to /journey, which is already listed.
        where: { status: "published", category: { not: "founder_note" } },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 200,
      }),
    ]);

    for (const p of projects) {
      entries.push({ url: `${base}/projects/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.6 });
    }
    for (const e of events) {
      entries.push({ url: `${base}/events/${e.slug}`, lastModified: e.updatedAt, changeFrequency: "weekly", priority: 0.6 });
    }
    for (const a of articles) {
      entries.push({ url: `${base}/awareness/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "monthly", priority: 0.6 });
    }
  } catch {
    // Leave the static routes in place if the database is unavailable.
  }

  return entries;
}
