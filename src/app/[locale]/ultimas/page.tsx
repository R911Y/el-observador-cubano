import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/editorial/empty-state";

export const revalidate = 300;

export default async function LatestPage({ params }: PageProps<"/[locale]/ultimas">) {
  const { locale: value } = await params;
  const locale = value as Locale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return (
    <Container className="pb-8 pt-8 sm:pt-10">
      <header className="border-t-2 border-accent pt-4">
        <h1 className="font-serif text-[var(--text-h1)] font-semibold tracking-tight text-ink">
          {t("nav.latest")}
        </h1>
        <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-muted">
          {t("home.sectionsIntro")}
        </p>
      </header>
      <div className="mt-10">
        <EmptyState
          title={t("home.latestEmpty")}
          body={t("home.noteEmpty")}
        />
      </div>
    </Container>
  );
}
