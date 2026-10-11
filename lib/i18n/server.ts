import { createTranslator } from "next-intl";
import { loadMessages, type MessageArea } from "@/i18n/messages";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/routing";
import { formattersFor, type Formatters } from "./format";

/**
 * Translations outside a page request (API routes, emails): `const t = await translatorFor("fr", "emails")`.
 * Falls back to English for anything that is not one of the site's languages.
 */
export async function translatorFor(locale: unknown, namespace: MessageArea) {
  const resolved: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const messages = await loadMessages(resolved);
  const t = createTranslator({ locale: resolved, messages, namespace });
  const format: Formatters = formattersFor(resolved);
  return { t, locale: resolved, format };
}
