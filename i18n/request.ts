import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { loadMessages } from "./messages";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: "Africa/Casablanca",
    // A missing key renders as its path, so it is visible in review rather than silently blank.
    getMessageFallback: ({ namespace, key }) => `${namespace ? `${namespace}.` : ""}${key}`,
  };
});
