import { createTranslator } from "next-intl";
import { loadMessages, type MessageArea } from "@/i18n/messages";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/routing";
import { formattersFor, type Formatters } from "./format";

/** A translator on plain string keys: the message files are not declared to TypeScript. */
export type Translate = (key: string, values?: Record<string, string | number | Date>) => string;

export interface ServerI18n {
  t: Translate;
  locale: Locale;
  format: Formatters;
}

/**
 * Translations outside a page request (API routes, emails): `const { t } = await translatorFor("fr", "emails")`.
 * Falls back to English for anything that is not one of the site's languages.
 */
export async function translatorFor(locale: unknown, namespace: MessageArea): Promise<ServerI18n> {
  const resolved: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const messages = (await loadMessages(resolved)) as unknown as Record<string, string>;
  const base = createTranslator({ locale: resolved, messages }) as unknown as Translate;
  const t: Translate = (key, values) => base(`${namespace}.${key}`, values);
  return { t, locale: resolved, format: formattersFor(resolved) };
}
