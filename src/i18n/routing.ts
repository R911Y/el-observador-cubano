import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/ultimas": { es: "/ultimas", en: "/latest" },
    "/buscar": { es: "/buscar", en: "/search" },
    "/acerca": { es: "/acerca", en: "/about" },
    "/radio": "/radio",
    "/edicion-impresa": { es: "/edicion-impresa", en: "/print-editions" },
    "/privacidad": { es: "/privacidad", en: "/privacy" },
    "/nacional": { es: "/nacional", en: "/national" },
    "/internacional": { es: "/internacional", en: "/international" },
    "/comunidades": { es: "/comunidades", en: "/communities" },
    "/sociedad": { es: "/sociedad", en: "/society" },
    "/economia": { es: "/economia", en: "/economy" },
    "/politica": { es: "/politica", en: "/politics" },
    "/cultura": { es: "/cultura", en: "/culture" },
    "/opinion": "/opinion",
    "/reportajes": { es: "/reportajes", en: "/features" },
    "/entrevistas": { es: "/entrevistas", en: "/interviews" },
    "/comunicados": { es: "/comunicados", en: "/statements" },
  },
});

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: string | undefined | null): value is Locale {
  if (!value) return false;
  return (routing.locales as readonly string[]).includes(value);
}
