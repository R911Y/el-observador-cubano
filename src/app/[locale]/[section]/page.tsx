import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale, routing, type Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/editorial/empty-state";
import {
  sectionInternalSlug,
  sectionKeyFromInternalSlug,
  sectionKeys,
  sectionPath,
  type SectionKey,
} from "@/lib/sections";

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    sectionKeys.map((key) => ({
      locale,
      section: sectionInternalSlug(key),
    })),
  );
}

function resolve(
  locale: string,
  section: string,
): { locale: Locale; key: SectionKey } | null {
  if (!isLocale(locale)) return null;
  const key = sectionKeyFromInternalSlug(section);
  if (!key) return null;
  return { locale, key };
}

export async function generateMetadata({
  params,
}: Omit<PageProps<"/[locale]/[section]">, "searchParams">): Promise<Metadata> {
  const { locale, section } = await params;
  const resolved = resolve(locale, section);
  if (!resolved) return {};

  const t = await getTranslations({
    locale: resolved.locale,
    namespace: "sections",
  });

  return {
    title: t(`${resolved.key}.name`),
    description: t(`${resolved.key}.description`),
    alternates: {
      canonical: sectionPath(resolved.locale, resolved.key),
      languages: {
        es: sectionPath("es", resolved.key),
        en: sectionPath("en", resolved.key),
        "x-default": sectionPath("es", resolved.key),
      },
    },
  };
}

export default async function SectionPage({
  params,
}: PageProps<"/[locale]/[section]">) {
  const { locale: localeValue, section } = await params;
  const resolved = resolve(localeValue, section);
  if (!resolved) notFound();

  const { locale, key } = resolved;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return (
    <Container className="pb-8 pt-8 sm:pt-10">
      <nav aria-label="Migas de pan" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href={`/${locale}`} className="hover:text-accent">
              {t("nav.home")}
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="text-ink">
            {t(`sections.${key}.name`)}
          </li>
        </ol>
      </nav>

      <header className="mt-6 border-t-2 border-accent pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          {t("section.pageLabel")}
        </p>
        <h1 className="mt-2 font-serif text-[var(--text-h1)] font-semibold tracking-tight text-ink">
          {t(`sections.${key}.name`)}
        </h1>
        <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-muted">
          {t(`sections.${key}.description`)}
        </p>
      </header>

      <div className="mt-10">
        <EmptyState
          title={t("section.emptyTitle")}
          body={t("section.emptyBody")}
        />
      </div>
    </Container>
  );
}
