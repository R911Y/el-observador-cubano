import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing, isLocale, type Locale } from "@/i18n/routing";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "@/styles/globals.css";

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-newsreader",
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

const themeScript = `(function(){try{var stored=window.localStorage.getItem("theme");var theme=stored==="light"||stored==="dark"?stored:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=theme;}catch(error){}})();`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171a1d" },
  ],
};

export async function generateMetadata({
  params,
}: Omit<LayoutProps<"/[locale]">, "children">): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};

  const locale: Locale = value;
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${messages.metadata.siteName} — ${messages.metadata.tagline}`,
      template: `%s · ${messages.metadata.siteName}`,
    },
    description: messages.metadata.description,
    applicationName: messages.metadata.siteName,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        es: "/es",
        en: "/en",
        "x-default": "/es",
      },
    },
    openGraph: {
      type: "website",
      siteName: messages.metadata.siteName,
      locale: locale === "es" ? "es_CU" : "en_US",
      title: messages.metadata.siteName,
      description: messages.metadata.description,
      url: `/${locale}`,
    },
    robots: {
      index: process.env.NEXT_PUBLIC_SITE_URL ? true : false,
      follow: process.env.NEXT_PUBLIC_SITE_URL ? true : false,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();

  setRequestLocale(value);
  const messages = await getMessages();

  return (
    <html
      lang={value}
      data-theme="light"
      suppressHydrationWarning
      className={`${newsreader.variable} ${inter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-canvas text-ink antialiased">
        <NextIntlClientProvider messages={messages}>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-button)] focus:bg-accent focus:px-4 focus:py-3 focus:text-on-accent"
          >
            {messages.common.skipToContent}
          </a>
          <SiteHeader locale={value} />
          <main id="contenido" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter locale={value} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
