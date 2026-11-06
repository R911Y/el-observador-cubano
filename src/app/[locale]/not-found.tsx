"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale();

  return (
    <Container className="py-16">
      <p className="font-serif text-[var(--text-display)] font-semibold leading-none text-accent">
        404
      </p>
      <h1 className="mt-4 font-serif text-[var(--text-h1)] font-semibold tracking-tight text-ink">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-muted">
        {t("body")}
      </p>
      <Link
        href={`/${locale}`}
        className="mt-8 inline-flex min-h-11 items-center bg-accent px-5 text-sm font-medium text-on-accent hover:bg-accent-strong"
      >
        {t("backHome")}
      </Link>
    </Container>
  );
}
