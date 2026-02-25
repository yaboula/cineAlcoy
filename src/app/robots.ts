// ──────────────────────────────────────────────────
// robots.ts — Sprint 14
// ──────────────────────────────────────────────────

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://cinema.app/sitemap.xml",
  };
}
