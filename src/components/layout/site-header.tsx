import { Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNav } from "./mobile-nav";
import { MoreMenu } from "./more-menu";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./wordmark";
import { primaryNav, sectionPath } from "@/lib/sections";
import { staticPath } from "@/lib/routes";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });

  return (
    <header className="border-b border-line bg-canvas">
      <div className="border-b border-line bg-surface/70">
        <Container className="flex min-h-10 flex-wrap items-center justify-between gap-2 py-1">
          <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted">
            {t("metadata.tagline")}
          </p>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </Container>
      </div>

      <Container className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-1 sm:gap-3">
          <MobileNav locale={locale} />
          <Link
            href={`/${locale}`}
            aria-label={`${t("metadata.siteName")} — ${t("metadata.tagline")}`}
            className="inline-flex min-h-11 items-center"
          >
            <Wordmark />
          </Link>
        </div>

        <Link
          href={staticPath(locale, "search")}
          className="inline-flex min-h-11 items-center gap-2 border border-line px-3 text-sm text-ink hover:bg-surface"
        >
          <Search aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">{t("common.search")}</span>
          <span className="sr-only sm:hidden">{t("common.search")}</span>
        </Link>
      </Container>

      <div className="hidden border-t border-line lg:block">
        <Container>
          <nav aria-label={t("nav.menuTitle")}>
            <ul className="flex flex-wrap items-center gap-x-1">
              <li>
                <Link
                  href={`/${locale}`}
                  className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink hover:text-accent"
                >
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link
                  href={staticPath(locale, "latest")}
                  className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink hover:text-accent"
                >
                  {t("nav.latest")}
                </Link>
              </li>
              {primaryNav.map((key) => (
                <li key={key}>
                  <Link
                    href={sectionPath(locale, key)}
                    className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink hover:text-accent"
                  >
                    {t(`sections.${key}.name`)}
                  </Link>
                </li>
              ))}
              <li>
                <MoreMenu locale={locale} />
              </li>
              <li className="ms-auto">
                <Link
                  href={staticPath(locale, "radio")}
                  className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink hover:text-accent"
                >
                  {t("nav.radio")}
                </Link>
              </li>
              <li>
                <Link
                  href={staticPath(locale, "print")}
                  className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink hover:text-accent"
                >
                  {t("nav.print")}
                </Link>
              </li>
            </ul>
          </nav>
        </Container>
      </div>
    </header>
  );
}
