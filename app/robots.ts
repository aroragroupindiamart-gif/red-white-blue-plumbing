import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/*?_rsc=*", "/_next/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
