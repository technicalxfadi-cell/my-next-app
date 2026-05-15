import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

import { AppProviders } from "@/components/providers/app-providers";
import { routing } from "@/i18n/routing";
import { getDirection } from "@/lib/utils";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AppProviders>
        <div lang={locale} dir={getDirection(locale)}>
          {children}
        </div>
      </AppProviders>
    </NextIntlClientProvider>
  );
}
