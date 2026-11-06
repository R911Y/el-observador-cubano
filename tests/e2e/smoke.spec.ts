import { expect, test } from "@playwright/test";

test("la portada española carga con su jerarquía", async ({ page }) => {
  await page.goto("/es");

  await expect(page).toHaveTitle(/El Observador Cubano/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "La redacción está en marcha",
  );
  await expect(
    page.getByRole("navigation", { name: "Secciones" }),
  ).toBeVisible();
});

test("las rutas inglesas usan el slug traducido", async ({ page }) => {
  await page.goto("/en/national");

  await expect(page).toHaveURL(/\/en\/national$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "National",
  );
});

test("una ruta desconocida devuelve 404 localizado", async ({ page }) => {
  const response = await page.goto("/es/esta-ruta-no-existe");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Página no encontrada",
  );
});
