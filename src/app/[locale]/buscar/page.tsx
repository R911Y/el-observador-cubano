import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/editorial/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { staticPath } from "@/lib/routes";

export async function generateMetadata({
  params,
}: Omit<PageProps<"/[locale]/buscar">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "search" });
  return { title: t("title"), description: t("description") };
}

export default async function SearchPage({
  params,
  searchParams,
}: PageProps<"/[locale]/buscar">) {
  const { locale: value } = await params;
  if (!isLocale(value)) return null;

  const locale: Locale = value;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const query = await searchParams;
  const raw = Array.isArray(query.q) ? query.q[0] : query.q;
  const term = typeof raw === "string" ? raw.trim().slice(0, 120) : "";

  return (
    <Container className="pb-8 pt-8 sm:pt-10">
      <header className="border-t-2 border-accent pt-4">
        <h1 className="font-serif text-[var(--text-h1)] font-semibold tracking-tight text-ink">
          {t("search.title")}
        </h1>
        <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-muted">
          {t("search.description")}
        </p>
      </header>

      <form
        action={staticPath(locale, "search")}
        method="get"
        role="search"
        className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label
            htmlFor="search-q"
            className="block text-sm font-medium text-ink"
          >
            {t("search.label")}
          </label>
          <Input
            id="search-q"
            name="q"
            type="search"
            defaultValue={term}
            placeholder={t("search.placeholder")}
            className="mt-1"
            autoComplete="off"
          />
        </div>
        <Button type="submit" size="md" className="sm:mb-0">
          {t("search.submit")}
        </Button>
      </form>

      <div className="mt-10">
        {term ? (
          <p className="mb-4 text-sm text-muted">
            {t("search.queryLabel", { query: term })}
          </p>
        ) : null}
        <EmptyState
          title={t("search.emptyTitle")}
          body={t("search.emptyBody")}
        />
      </div>
    </Container>
  );
}
