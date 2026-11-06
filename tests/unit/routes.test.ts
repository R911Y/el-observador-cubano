import { describe, expect, it } from "vitest";
import { localizePath, staticPath } from "@/lib/routes";
import {
  sectionKeyFromInternalSlug,
  sectionKeyFromSlug,
  sectionPath,
} from "@/lib/sections";

describe("rutas localizadas", () => {
  it("construye rutas con prefijo de idioma", () => {
    expect(staticPath("es", "about")).toBe("/es/acerca");
    expect(staticPath("en", "about")).toBe("/en/about");
    expect(staticPath("en", "latest")).toBe("/en/latest");
  });

  it("traduce secciones al cambiar de idioma", () => {
    expect(sectionPath("es", "nacional")).toBe("/es/nacional");
    expect(sectionPath("en", "nacional")).toBe("/en/national");
    expect(localizePath("/es/nacional", "en")).toBe("/en/national");
    expect(localizePath("/en/national", "es")).toBe("/es/nacional");
  });

  it("traduce páginas institucionales", () => {
    expect(localizePath("/es/acerca", "en")).toBe("/en/about");
    expect(localizePath("/en/print-editions", "es")).toBe(
      "/es/edicion-impresa",
    );
  });

  it("conserva los segmentos posteriores", () => {
    expect(localizePath("/es/noticias/una-nota", "en")).toBe(
      "/en/noticias/una-nota",
    );
  });

  it("resuelve el slug interno de una sección", () => {
    expect(sectionKeyFromInternalSlug("nacional")).toBe("nacional");
    expect(sectionKeyFromInternalSlug("national")).toBeUndefined();
    expect(sectionKeyFromSlug("en", "national")).toBe("nacional");
  });

  it("resuelve la raíz y las rutas sin idioma", () => {
    expect(localizePath("/", "en")).toBe("/en");
    expect(localizePath("/es", "en")).toBe("/en");
  });
});
