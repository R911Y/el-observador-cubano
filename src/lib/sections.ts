import { routing, type Locale } from "@/i18n/routing";

export const sectionKeys = [
  "nacional",
  "internacional",
  "comunidades",
  "sociedad",
  "economia",
  "politica",
  "cultura",
  "opinion",
  "reportajes",
  "entrevistas",
  "comunicados",
] as const;

export type SectionKey = (typeof sectionKeys)[number];

const sectionSlugs: Record<SectionKey, Record<Locale, string>> = {
  nacional: { es: "nacional", en: "national" },
  internacional: { es: "internacional", en: "international" },
  comunidades: { es: "comunidades", en: "communities" },
  sociedad: { es: "sociedad", en: "society" },
  economia: { es: "economia", en: "economy" },
  politica: { es: "politica", en: "politics" },
  cultura: { es: "cultura", en: "culture" },
  opinion: { es: "opinion", en: "opinion" },
  reportajes: { es: "reportajes", en: "features" },
  entrevistas: { es: "entrevistas", en: "interviews" },
  comunicados: { es: "comunicados", en: "statements" },
};

export const primaryNav: SectionKey[] = [
  "nacional",
  "internacional",
  "comunidades",
  "sociedad",
  "economia",
  "politica",
  "cultura",
  "opinion",
];

export const secondaryNav: SectionKey[] = [
  "reportajes",
  "entrevistas",
  "comunicados",
];

export function sectionSlug(locale: Locale, key: SectionKey): string {
  return sectionSlugs[key][locale];
}

export function sectionPath(locale: Locale, key: SectionKey): string {
  return `/${locale}/${sectionSlugs[key][locale]}`;
}

export function sectionKeyFromSlug(
  locale: Locale,
  slug: string,
): SectionKey | undefined {
  return sectionKeys.find((key) => sectionSlugs[key][locale] === slug);
}

/**
 * El segmento interno de la ruta es siempre el slug español. El proxy de
 * next-intl reescribe `/en/national` a `/en/nacional` antes de renderizar.
 */
export function sectionKeyFromInternalSlug(
  slug: string,
): SectionKey | undefined {
  return sectionKeys.find((key) => sectionSlugs[key].es === slug);
}

export function sectionInternalSlug(key: SectionKey): string {
  return sectionSlugs[key].es;
}


export function isDefaultLocale(locale: Locale): boolean {
  return locale === routing.defaultLocale;
}
