"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem("theme", theme);
  } catch {
    // El almacenamiento puede estar bloqueado; el tema sigue funcionando
    // durante esta visita.
  }
}

/**
 * Dos botones intercambiables por CSS. Evita leer localStorage en un efecto y
 * el consiguiente parpadeo o desajuste de hidratación.
 */
export function ThemeToggle() {
  const t = useTranslations("common");

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => applyTheme("dark")}
        aria-label={t("themeDark")}
        title={t("themeDark")}
        className="dark:hidden"
      >
        <Moon aria-hidden="true" className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => applyTheme("light")}
        aria-label={t("themeLight")}
        title={t("themeLight")}
        className="hidden dark:inline-flex"
      >
        <Sun aria-hidden="true" className="size-4" />
      </Button>
    </>
  );
}
