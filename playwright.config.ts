import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

/**
 * En algunos entornos el CDN de Playwright no está disponible. Se puede usar
 * un navegador instalado en el sistema con PLAYWRIGHT_CHANNEL=msedge|chrome.
 * En CI se instala Chromium con `npx playwright install`.
 */
const channel = process.env.PLAYWRIGHT_CHANNEL as
  | "chrome"
  | "msedge"
  | undefined;

const webServer = process.env.PLAYWRIGHT_BASE_URL
  ? undefined
  : {
      command: "npm run dev",
      url: `${baseURL}/es`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    };

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    locale: "es-ES",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(channel ? { channel } : {}),
      },
    },
  ],
  ...(webServer ? { webServer } : {}),
});
