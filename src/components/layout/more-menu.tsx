"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { secondaryNav, sectionPath } from "@/lib/sections";
import { staticPath } from "@/lib/routes";

export function MoreMenu({ locale }: { locale: Locale }) {
  const t = useTranslations();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 px-2">
          {t("nav.more")}
          <ChevronDown aria-hidden="true" className="size-3.5" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 min-w-52 rounded-[var(--radius-card)] border border-line bg-canvas p-1.5 shadow-lg"
        >
          {secondaryNav.map((key) => (
            <DropdownMenu.Item key={key} asChild>
              <Link
                href={sectionPath(locale, key)}
                className="flex min-h-10 items-center rounded-[2px] px-3 text-sm text-ink outline-none data-[highlighted]:bg-surface"
              >
                {t(`sections.${key}.name`)}
              </Link>
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1.5 h-px bg-line" />
          <DropdownMenu.Item asChild>
            <Link
              href={staticPath(locale, "radio")}
              className="flex min-h-10 items-center rounded-[2px] px-3 text-sm text-ink outline-none data-[highlighted]:bg-surface"
            >
              {t("nav.radio")}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href={staticPath(locale, "print")}
              className="flex min-h-10 items-center rounded-[2px] px-3 text-sm text-ink outline-none data-[highlighted]:bg-surface"
            >
              {t("nav.print")}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href={staticPath(locale, "about")}
              className="flex min-h-10 items-center rounded-[2px] px-3 text-sm text-ink outline-none data-[highlighted]:bg-surface"
            >
              {t("nav.about")}
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
