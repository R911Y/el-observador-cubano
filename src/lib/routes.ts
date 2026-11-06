import { isLocale, routing, type Locale } from "@/i18n/routing";
import { sectionKeyFromSlug, sectionSlug } from "./sections";

/**
 * Rutas estáticas con distinto slug en cada idioma.
 * Se usa para que el selector de idioma conserve la página actual.
 */
export const staticRoutes = {
  latest: { es: "ultimas", en: "latest" },
  search: { es: "buscar", en: "search" },
  about: { es: "acerca", en: "about" },
  radio: { es: "radio", en: "radio" },
  print: { es: "edicion-impresa", en: "print-editions" },
  privacy: { es: "privacidad", en: "privacy" },
} as const satisfies Record<string, Record<Locale, string>>;

export type StaticRouteKey = keyof typeof staticRoutes;

export function staticPath(locale: Locale, key: StaticRouteKey): string {
  return `/${locale}/${staticRoutes[key][locale]}`;
}

function translateSegment(
  source: Locale,
  target: Locale,
  segment: string,
): string | undefined {
  const staticMatch = Object.values(staticRoutes).find(
    (route) => route[source] === segment,
  );
  if (staticMatch) return staticMatch[target];

  const sectionKey = sectionKeyFromSlug(source, segment);
  if (sectionKey) return sectionSlug(target, sectionKey);

  return undefined;
}

/**
 * Traduce el primer segmento significativo de una ruta.
 * Los segmentos posteriores (slugs de artículos, paginación) se conservan.
 */
export function localizePath(pathname: string, targetLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  const [maybeLocale, ...rest] = segments;

  if (!isLocale(maybeLocale)) {
    return `/${targetLocale}`;
  }

  if (rest.length === 0) {
    return `/${targetLocale}`;
  }

  const [first, ...tail] = rest;
  const translated = first
    ? translateSegment(maybeLocale, targetLocale, first)
    : undefined;

  const localized = translated ?? first;
  return `/${[targetLocale, localized, ...tail].filter(Boolean).join("/")}`;
}

export function isSupportedLocale(value: string): value is Locale {
  return isLocale(value);
}

export const locales = routing.locales;
