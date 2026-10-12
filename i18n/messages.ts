import type { Locale } from "./routing";

/**
 * Messages live in one file per area and language: `messages/<locale>/<area>.json`. Each file is
 * the namespace of its area, so `messages/fr/home.json` is read with `useTranslations("home")`.
 * The three languages must carry the same keys; `lib/__tests__/i18n.test.ts` enforces it.
 */
export const MESSAGE_AREAS = [
  "common",
  "meta",
  "home",
  "sections",
  "simulator",
  "calculator",
  "pricing",
  "faq",
  "beta",
  "emails",
] as const;
export type MessageArea = (typeof MESSAGE_AREAS)[number];

export type Messages = Record<MessageArea, Record<string, unknown>>;

export async function loadMessages(locale: Locale): Promise<Messages> {
  const parts = await Promise.all(
    MESSAGE_AREAS.map(async (area) => {
      const mod = (await import(`../messages/${locale}/${area}.json`)) as { default: Record<string, unknown> };
      return [area, mod.default] as const;
    }),
  );
  return Object.fromEntries(parts) as Messages;
}
