import { expect, test, type Page } from "@playwright/test";

// Every page in French and Arabic: served, correctly tagged, right-to-left where it should be, no raw
// message keys, no horizontal scroll, and the language switcher moves between the same pages.
const PATHS = ["/", "/simulator", "/calculator", "/pricing", "/beta", "/faq"] as const;
const LOCALES = [
  { code: "fr", dir: "ltr" },
  { code: "ar", dir: "rtl" },
  { code: "ary", dir: "rtl" },
] as const;

// A missing translation renders as its key path (see i18n/request.ts), which this catches.
const RAW_KEY = /\b(common|meta|home|sections|simulator|calculator|pricing|faq|beta|emails)\.[a-zA-Z]+(\.[a-zA-Z0-9_]+)+\b/;

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "horizontal overflow (px)").toBeLessThanOrEqual(1);
}

for (const { code, dir } of LOCALES) {
  for (const pathname of PATHS) {
    test(`${code} ${pathname}: served, tagged, no raw keys, no sideways scroll`, async ({ page }) => {
      const response = await page.goto(`/${code}${pathname === "/" ? "" : pathname}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", code);
      await expect(page.locator("html")).toHaveAttribute("dir", dir);
      const text = await page.locator("body").innerText();
      expect(text).not.toMatch(RAW_KEY);
      await noHorizontalScroll(page);
    });
  }
}

test("English stays unprefixed and /en redirects to it", async ({ page }) => {
  await page.goto("/en/pricing");
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("a French browser is sent to /fr on its first visit", async ({ browser }) => {
  const context = await browser.newContext({ locale: "fr-MA", extraHTTPHeaders: { "Accept-Language": "fr-MA,fr;q=0.9" } });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr$/);
  await context.close();
});

test("the language switcher keeps the visitor on the same page", async ({ page }, info) => {
  const width = info.project.use.viewport!.width;
  await page.goto("/pricing");
  if (width < 1024) {
    await page.getByRole("button", { name: /menu/i }).first().click();
  }
  const switcher = page.locator("[data-language-switcher]").filter({ visible: true }).first();
  await switcher.selectOption("ar");
  await expect(page).toHaveURL(/\/ar\/pricing$/, { timeout: 20_000 });
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl", { timeout: 20_000 });
  if (width < 1024) {
    await page.getByRole("button", { name: /menu|القائمة/i }).first().click();
  }
  const back = page.locator("[data-language-switcher]").filter({ visible: true }).first();
  await back.selectOption("en");
  await expect(page).toHaveURL(/^https?:\/\/[^/]+\/pricing$/, { timeout: 20_000 });
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr", { timeout: 20_000 });
});

test("hreflang alternates are emitted for every language", async ({ page }) => {
  await page.goto("/fr/faq");
  const hrefs = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((links) =>
    links.map((l) => `${l.getAttribute("hreflang")}=${l.getAttribute("href")}`),
  );
  expect(hrefs.some((h) => h.startsWith("fr=") && h.endsWith("/fr/faq"))).toBe(true);
  expect(hrefs.some((h) => h.startsWith("ar=") && h.endsWith("/ar/faq"))).toBe(true);
  expect(hrefs.some((h) => h.startsWith("en=") && h.endsWith("/faq"))).toBe(true);
  expect(hrefs.some((h) => h.startsWith("x-default="))).toBe(true);
});
