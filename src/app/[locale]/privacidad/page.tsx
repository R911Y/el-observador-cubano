import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: Omit<PageProps<"/[locale]/privacidad">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("title"), description: t("description") };
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacidad">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const criteria = [
    t("privacy.principles.minimal"),
    t("privacy.principles.analytics"),
    t("privacy.principles.rights"),
    t("privacy.principles.retention"),
  ];

  return (
    <Container className="pb-8 pt-8 sm:pt-10">
      <header className="border-t-2 border-accent pt-4">
        <Badge tone="draft">{t("common.draft")}</Badge>
        <h1 className="mt-3 font-serif text-[var(--text-h1)] font-semibold tracking-tight text-ink">
          {t("privacy.title")}
        </h1>
      </header>

      <div className="mt-8 max-w-[70ch]">
        <div className="border border-accent/40 bg-surface p-5">
          <h2 className="font-serif text-xl font-semibold text-ink">
            {t("privacy.draftTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            {t("privacy.draftBody")}
          </p>
        </div>

        <h2 className="mt-10 border-t border-line pt-3 font-serif text-2xl font-semibold text-ink">
          {t("privacy.principlesTitle")}
        </h2>
        <ul className="mt-4 space-y-3">
          {criteria.map((item) => (
            <li
              key={item}
              className="border-l-2 border-accent pl-3 text-base leading-relaxed text-ink"
            >
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm leading-relaxed text-muted">
          {t("privacy.pending")}
        </p>
      </div>
    </Container>
  );
}
