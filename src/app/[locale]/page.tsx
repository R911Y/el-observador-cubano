import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/editorial/empty-state";
import { SectionHeader } from "@/components/editorial/section-header";
import { primaryNav, sectionPath } from "@/lib/sections";
import { staticPath } from "@/lib/routes";

export const revalidate = 300;

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale: value } = await params;
  const locale = value as Locale;
  setRequestLocale(locale);

  const t = await getTranslations({ locale });

  return (
    <Container className="pb-8 pt-8 sm:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <Badge tone="accent">{t("home.kicker")}</Badge>
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          {t("metadata.tagline")}
        </p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
        <section aria-labelledby="portada-principal">
          <h1
            id="portada-principal"
            className="max-w-[18ch] font-serif text-[var(--text-display)] font-semibold leading-[1.02] tracking-[-0.02em] text-ink"
          >
            {t("home.leadTitle")}
          </h1>
          <p className="mt-5 max-w-[58ch] font-serif text-lg leading-relaxed text-ink sm:text-xl">
            {t("home.leadBody")}
          </p>
          <p className="mt-6 max-w-[58ch] border-l-2 border-accent pl-3 text-sm leading-relaxed text-muted">
            {t("home.leadNote")}
          </p>
        </section>

        <section aria-labelledby="ultimas-title" className="lg:border-s lg:border-line lg:ps-8">
          <SectionHeader title={t("home.latestTitle")} id="ultimas-title" />
          <EmptyState
            title={t("home.latestEmpty")}
            body={t("home.noteEmpty")}
          />
        </section>
      </div>

      <section aria-labelledby="secciones-title" className="mt-14">
        <SectionHeader
          title={t("home.sectionsTitle")}
          id="secciones-title"
          linkLabel={t("common.all")}
          href={staticPath(locale, "latest")}
        />
        <p className="mb-6 max-w-[70ch] text-sm text-muted">
          {t("home.sectionsIntro")}
        </p>
        <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {primaryNav.map((key) => (
            <li key={key} className="bg-canvas">
              <Link
                href={sectionPath(locale, key)}
                className="flex h-full flex-col gap-2 p-5 transition-colors hover:bg-surface"
              >
                <span className="font-serif text-xl font-semibold text-ink">
                  {t(`sections.${key}.name`)}
                </span>
                <span className="text-sm leading-relaxed text-muted">
                  {t(`sections.${key}.description`)}
                </span>
                <span className="mt-auto pt-3 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                  {t("common.all")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <section aria-labelledby="radio-title">
          <SectionHeader title={t("home.radioTitle")} id="radio-title" />
          <p className="mb-4 max-w-[60ch] text-sm text-muted">
            {t("home.radioBody")}
          </p>
          <EmptyState title={t("home.radioEmpty")} body={t("radio.emptyBody")} />
          <Link
            href={staticPath(locale, "radio")}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent-strong"
          >
            {t("common.all")}
          </Link>
        </section>

        <section aria-labelledby="impreso-title">
          <SectionHeader title={t("home.printTitle")} id="impreso-title" />
          <p className="mb-4 max-w-[60ch] text-sm text-muted">
            {t("home.printBody")}
          </p>
          <EmptyState title={t("home.printEmpty")} body={t("print.emptyBody")} />
          <Link
            href={staticPath(locale, "print")}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent-strong"
          >
            {t("common.all")}
          </Link>
        </section>
      </div>

      <section
        aria-labelledby="boletin-title"
        className="mt-14 border border-line bg-surface p-6 sm:p-8"
      >
        <h2
          id="boletin-title"
          className="font-serif text-2xl font-semibold text-ink"
        >
          {t("home.newsletterTitle")}
        </h2>
        <p className="mt-2 max-w-[66ch] text-sm leading-relaxed text-muted">
          {t("home.newsletterBody")}
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-accent">
          {t("common.comingSoon")}
        </p>
      </section>
    </Container>
  );
}
