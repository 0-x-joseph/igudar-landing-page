import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/i18n/metadata";

// Indexing is left open, matching the layout's default. Founders: switch to `disallow: "/"` to hide the site until launch.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
