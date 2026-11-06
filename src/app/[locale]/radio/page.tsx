import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/editorial/empty-state";

export async function generateMetadata({
  params,
}: Omit<PageProps<"/[locale]/radio">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "radio" });
  return { title: t("title"), description: t("description") };
}

export default async function RadioPage({ params }: PageProps<"/[locale]/radio">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return (
    <Container className="pb-8 pt-8 sm:pt-10">
      <header className="border-t-2 border-accent pt-4">
        <h1 className="font-serif text-[var(--text-h1)] font-semibold tracking-tight text-ink">
          {t("radio.title")}
        </h1>
        <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-muted">
          {t("radio.description")}
        </p>
      </header>
      <div className="mt-10 max-w-2xl">
        <EmptyState
          title={t("radio.emptyTitle")}
          body={t("radio.emptyBody")}
        />
      </div>
    </Container>
  );
}
