import { readFileSync } from "node:fs";
import path from "node:path";
import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { MESSAGE_AREAS, type Messages } from "@/i18n/messages";
import { LOCALE_META, type Locale } from "@/i18n/routing";

const ROOT = path.resolve(import.meta.dirname, "..", "..", "..");

/** Reads `messages/<locale>/*.json` synchronously, the way the request config assembles them. */
export function messagesFor(locale: Locale): Messages {
  const out: Record<string, unknown> = {};
  for (const area of MESSAGE_AREAS) {
    const file = path.join(ROOT, "messages", locale, `${area}.json`);
    out[area] = JSON.parse(readFileSync(file, "utf8"));
  }
  return out as Messages;
}

export function IntlWrapper({ children, locale = "en" }: { children: ReactNode; locale?: Locale }) {
  return (
    <NextIntlClientProvider locale={locale} messages={messagesFor(locale)} timeZone="Africa/Casablanca">
      <div dir={LOCALE_META[locale].dir}>{children}</div>
    </NextIntlClientProvider>
  );
}

/** `render` with the site's messages, English unless told otherwise. */
export function renderIntl(ui: ReactElement, options: RenderOptions & { locale?: Locale } = {}) {
  const { locale = "en", ...rest } = options;
  return render(ui, {
    ...rest,
    wrapper: ({ children }) => <IntlWrapper locale={locale}>{children}</IntlWrapper>,
  });
}
