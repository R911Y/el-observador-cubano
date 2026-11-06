import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const indexable = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

  return {
    rules: indexable
      ? [
          {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/admin/"],
          },
        ]
      : [
          {
            userAgent: "*",
            disallow: "/",
          },
        ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
