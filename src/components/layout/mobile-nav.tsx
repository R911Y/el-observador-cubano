"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  primaryNav,
  secondaryNav,
  sectionPath,
} from "@/lib/sections";
import { staticPath } from "@/lib/routes";

export function MobileNav({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const allSections = [...primaryNav, ...secondaryNav];

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("common.openMenu")}
          className="lg:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-[min(22rem,90vw)] flex-col overflow-y-auto border-r border-line bg-canvas p-5 shadow-xl"
        >
          <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
            <Dialog.Title className="font-serif text-xl font-semibold text-ink">
              {t("nav.menuTitle")}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("common.closeMenu")}
              >
                <X aria-hidden="true" className="size-5" />
              </Button>
            </Dialog.Close>
          </div>

          <nav aria-label={t("nav.menuTitle")} className="py-4">
            <ul className="divide-y divide-line">
              <li>
                <Dialog.Close asChild>
                  <Link
                    href={`/${locale}`}
                    className="flex min-h-12 items-center font-serif text-lg text-ink"
                  >
                    {t("nav.home")}
                  </Link>
                </Dialog.Close>
              </li>
              <li>
                <Dialog.Close asChild>
                  <Link
                    href={staticPath(locale, "latest")}
                    className="flex min-h-12 items-center font-serif text-lg text-ink"
                  >
                    {t("nav.latest")}
                  </Link>
                </Dialog.Close>
              </li>
              {allSections.map((key) => (
                <li key={key}>
                  <Dialog.Close asChild>
                    <Link
                      href={sectionPath(locale, key)}
                      className="flex min-h-12 items-center font-sans text-base text-ink"
                    >
                      {t(`sections.${key}.name`)}
                    </Link>
                  </Dialog.Close>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto space-y-2 border-t border-line pt-4">
            <Dialog.Close asChild>
              <Link
                href={staticPath(locale, "radio")}
                className="flex min-h-11 items-center text-sm font-medium text-ink"
              >
                {t("nav.radio")}
              </Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link
                href={staticPath(locale, "print")}
                className="flex min-h-11 items-center text-sm font-medium text-ink"
              >
                {t("nav.print")}
              </Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link
                href={staticPath(locale, "about")}
                className="flex min-h-11 items-center text-sm font-medium text-ink"
              >
                {t("nav.about")}
              </Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link
                href={staticPath(locale, "privacy")}
                className="flex min-h-11 items-center text-sm font-medium text-ink"
              >
                {t("footer.privacy")}
              </Link>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
