"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { localizePath } from "@/lib/routes";
import { cn } from "@/lib/utils";

const labels: Record<Locale, string> = {
  es: "ES",
  en: "EN",
};

const names: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const current = useLocale() as Locale;

  return (
    <nav aria-label={t("language")} className="flex items-center gap-1">
      {routing.locales.map((locale, index) => (
        <span key={locale} className="flex items-center gap-1">
          {index > 0 ? (
            <span aria-hidden="true" className="text-line">
              /
            </span>
          ) : null}
          <Link
            href={localizePath(pathname, locale)}
            hrefLang={locale}
            lang={locale}
            aria-current={locale === current ? "true" : undefined}
            title={names[locale]}
            className={cn(
              "inline-flex min-h-9 min-w-9 items-center justify-center px-1 text-xs font-semibold tracking-[0.12em] uppercase",
              locale === current
                ? "text-accent underline decoration-accent decoration-2 underline-offset-4"
                : "text-muted hover:text-ink",
            )}
          >
            {labels[locale]}
            <span className="sr-only"> — {names[locale]}</span>
          </Link>
        </span>
      ))}
    </nav>
  );
}
