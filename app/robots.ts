import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const base = SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private and staff-only areas out of search engines (both pages
        // also set noindex metadata; this is belt and braces for crawlers that
        // never render the page).
        disallow: ["/admin", "/api/", "/track-request", "/login"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
