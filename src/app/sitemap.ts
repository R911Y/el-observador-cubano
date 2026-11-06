import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { siteUrl } from "@/lib/env";
import { sectionKeys, sectionPath } from "@/lib/sections";
import { staticPath, type StaticRouteKey } from "@/lib/routes";

const publicStaticRoutes: StaticRouteKey[] = [
  "latest",
  "about",
  "radio",
  "print",
  "privacy",
];

function alternateLanguages(
  build: (locale: Locale) => string,
): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, build(locale)]),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();

  const entries: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: `${base}/${locale}`,
    changeFrequency: "daily",
    priority: 1,
    alternates: {
      languages: alternateLanguages((item) => `${base}/${item}`),
    },
  }));

  for (const key of publicStaticRoutes) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${base}${staticPath(locale, key)}`,
        changeFrequency: key === "latest" ? "daily" : "monthly",
        priority: key === "latest" ? 0.8 : 0.5,
        alternates: {
          languages: alternateLanguages((item) =>
            `${base}${staticPath(item, key)}`,
          ),
        },
      });
    }
  }

  for (const key of sectionKeys) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${base}${sectionPath(locale, key)}`,
        changeFrequency: "daily",
        priority: 0.7,
        alternates: {
          languages: alternateLanguages((item) =>
            `${base}${sectionPath(item, key)}`,
          ),
        },
      });
    }
  }

  return entries;
}
