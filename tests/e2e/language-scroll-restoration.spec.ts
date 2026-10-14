import { expect, test, type Page } from "@playwright/test";

async function readingPosition(page: Page, selector: string) {
  return page.locator(selector).evaluate((section) => {
    const offset = Math.max(0, document.querySelector("[data-scroll-navigation]")?.getBoundingClientRect().bottom ?? 0) + 16;
    const bounds = section.getBoundingClientRect();
    return (offset - bounds.top) / bounds.height;
  });
}

async function startReading(page: Page, selector: string, progress = 0.4) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.locator(selector).evaluate((section, ratio) => {
    const offset = Math.max(0, document.querySelector("[data-scroll-navigation]")?.getBoundingClientRect().bottom ?? 0) + 16;
    const bounds = section.getBoundingClientRect();
    window.scrollTo({ top: bounds.top + scrollY + bounds.height * ratio - offset, behavior: "instant" });
  }, progress);
  await expect.poll(() => readingPosition(page, selector)).toBeGreaterThan(progress - 0.01);
  await expect.poll(() => readingPosition(page, selector)).toBeLessThan(progress + 0.01);
}

async function switchLanguage(page: Page, locale: string) {
  if (page.viewportSize()!.width < 1024) {
    await page.getByRole("button", { name: /menu|القائمة/i }).filter({ visible: true }).first().click();
  }
  await page.locator("[data-language-switcher]").filter({ visible: true }).first().selectOption(locale);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await page.waitForLoadState("networkidle");
}

test("language switches preserve the same section through French, Arabic, Darija and English", async ({ page }, info) => {
  await page.goto("/");
  await startReading(page, "#how-it-works");
  const original = await readingPosition(page, "#how-it-works");
  for (const locale of ["fr", "ar", "ary", "en"]) {
    await switchLanguage(page, locale);
    await expect.poll(async () => Math.abs(await readingPosition(page, "#how-it-works") - original)).toBeLessThan(0.015);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" || locale === "ary" ? "rtl" : "ltr");
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("igudar:language-scroll"))).toBeNull();
    await page.screenshot({ path: `test-results/language-scroll-${locale}-${info.project.name}.png` });
  }
});

test("refresh after changing language retains the translated position", async ({ page }) => {
  await page.goto("/");
  await startReading(page, "#ai-powered");
  const original = await readingPosition(page, "#ai-powered");
  await switchLanguage(page, "ar");
  await expect.poll(async () => Math.abs(await readingPosition(page, "#ai-powered") - original)).toBeLessThan(0.015);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("igudar:language-scroll"))).toBeNull();
  const position = await page.evaluate(() => scrollY);
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect.poll(() => page.evaluate((top) => Math.abs(scrollY - top), position)).toBeLessThanOrEqual(2);
});

test("a language switch with an old anchor keeps the current section, not the anchor", async ({ page }) => {
  await page.goto("/#how-it-works");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await startReading(page, "#ai-powered");
  const original = await readingPosition(page, "#ai-powered");
  await switchLanguage(page, "fr");
  await expect(page).toHaveURL(/\/fr#how-it-works$/);
  await expect.poll(async () => Math.abs(await readingPosition(page, "#ai-powered") - original)).toBeLessThan(0.015);
});

test("unnamed sections keep their relative position on a translated pricing page", async ({ page }) => {
  await page.goto("/pricing");
  await startReading(page, "main > section:nth-of-type(3)");
  const original = await readingPosition(page, "main > section:nth-of-type(3)");
  await switchLanguage(page, "fr");
  await expect(page).toHaveURL(/\/fr\/pricing$/);
  await expect.poll(async () => Math.abs(await readingPosition(page, "main > section:nth-of-type(3)") - original)).toBeLessThan(0.015);
});

test("changing language at the top stays at the top", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await switchLanguage(page, "fr");
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test("a language switch at the footer stays at the bottom of the translated page", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await switchLanguage(page, "ar");
  await expect.poll(() => page.evaluate(() => Math.abs(
    document.documentElement.scrollHeight - innerHeight - scrollY,
  ))).toBeLessThanOrEqual(2);
});

test("blocked storage does not prevent a language switch", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException("Blocked", "SecurityError"); };
    Storage.prototype.setItem = () => { throw new DOMException("Blocked", "SecurityError"); };
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await switchLanguage(page, "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
