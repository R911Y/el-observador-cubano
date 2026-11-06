import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: Omit<PageProps<"/[locale]/acerca">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("description") };
}

export default async function AboutPage({ params }: PageProps<"/[locale]/acerca">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const principles = [
    t("about.principles.accuracy"),
    t("about.principles.independence"),
    t("about.principles.corrections"),
    t("about.principles.privacy"),
  ];

  return (
    <Container className="pb-8 pt-8 sm:pt-10">
      <header className="border-t-2 border-accent pt-4">
        <h1 className="font-serif text-[var(--text-h1)] font-semibold tracking-tight text-ink">
          {t("about.title")}
        </h1>
        <p className="mt-3 max-w-[62ch] font-serif text-lg leading-relaxed text-ink">
          {t("about.introBody")}
        </p>
      </header>

      <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section aria-labelledby="institucional-pendiente">
          <div className="flex items-center gap-3">
            <Badge tone="draft">{t("common.draft")}</Badge>
            <h2
              id="institucional-pendiente"
              className="font-serif text-2xl font-semibold text-ink"
            >
              {t("about.placeholderTitle")}
            </h2>
          </div>
          <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted">
            {t("about.placeholderBody")}
          </p>
        </section>

        <section aria-labelledby="principios">
          <h2
            id="principios"
            className="border-t border-line pt-3 font-serif text-xl font-semibold text-ink"
          >
            {t("about.principlesTitle")}
          </h2>
          <ul className="mt-4 space-y-3">
            {principles.map((principle) => (
              <li
                key={principle}
                className="border-l-2 border-accent pl-3 text-sm leading-relaxed text-ink"
              >
                {principle}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Container>
  );
}
