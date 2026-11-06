import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { primaryNav, sectionPath } from "@/lib/sections";
import { staticPath } from "@/lib/routes";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t-2 border-accent bg-surface">
      <Container className="py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-lg font-semibold text-ink">
              {t("metadata.siteName")}
            </p>
            <p className="mt-1 font-sans text-xs uppercase tracking-[0.16em] text-muted">
              {t("metadata.tagline")}
            </p>
            <div className="mt-4">
              <Badge tone="draft">{t("common.draft")}</Badge>
              <p className="mt-2 max-w-[34ch] text-xs leading-relaxed text-muted">
                {t("footer.draftNotice")}
              </p>
            </div>
          </div>

          <nav aria-label={t("footer.navigation")}>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {t("footer.navigation")}
            </p>
            <ul className="mt-3 space-y-1">
              <li>
                <Link
                  href={staticPath(locale, "latest")}
                  className="inline-flex min-h-9 items-center text-sm text-ink hover:text-accent"
                >
                  {t("nav.latest")}
                </Link>
              </li>
              {primaryNav.slice(0, 5).map((key) => (
                <li key={key}>
                  <Link
                    href={sectionPath(locale, key)}
                    className="inline-flex min-h-9 items-center text-sm text-ink hover:text-accent"
                  >
                    {t(`sections.${key}.name`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t("footer.institutional")}>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {t("footer.institutional")}
            </p>
            <ul className="mt-3 space-y-1">
              <li>
                <Link
                  href={staticPath(locale, "about")}
                  className="inline-flex min-h-9 items-center text-sm text-ink hover:text-accent"
                >
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link
                  href={staticPath(locale, "privacy")}
                  className="inline-flex min-h-9 items-center text-sm text-ink hover:text-accent"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href={staticPath(locale, "search")}
                  className="inline-flex min-h-9 items-center text-sm text-ink hover:text-accent"
                >
                  {t("common.search")}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {t("nav.radio")} · {t("nav.print")}
            </p>
            <ul className="mt-3 space-y-1">
              <li>
                <Link
                  href={staticPath(locale, "radio")}
                  className="inline-flex min-h-9 items-center text-sm text-ink hover:text-accent"
                >
                  {t("radio.title")}
                </Link>
              </li>
              <li>
                <Link
                  href={staticPath(locale, "print")}
                  className="inline-flex min-h-9 items-center text-sm text-ink hover:text-accent"
                >
                  {t("print.title")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.rights", { year })}</p>
          <p>{t("footer.builtWith")}</p>
        </div>
      </Container>
    </footer>
  );
}
