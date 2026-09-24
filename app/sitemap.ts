import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const publicRoutes = [
    "",
    "/about",
    "/initiatives",
    "/events",
    "/awareness",
    "/gallery",
    "/contact",
    "/request-collection",
    "/login",
  ];
  return publicRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path === "/request-collection" ? 0.9 : 0.6,
  }));
}
