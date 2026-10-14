import { expect, test } from "@playwright/test";

for (const locale of ["en", "fr", "ar", "ary"]) {
  const prefix = locale === "en" ? "" : `/${locale}`;

  test(`FAQ headings match the shared display font in ${locale}`, async ({ page }, info) => {
    await page.goto(`${prefix}/pricing`);
    await page.evaluate(() => document.fonts.ready);
    const displayFont = await page.locator("h1").evaluate((node) => getComputedStyle(node).fontFamily);

    await page.goto(`${prefix}/faq`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    const title = page.locator("h1");
    await expect(title).toHaveCSS("font-family", displayFont);
    await expect(title).toHaveCSS("font-weight", "600");
    for (const heading of await page.locator("h2").all()) {
      await expect(heading).toHaveCSS("font-family", displayFont);
    }
    const brand = title.locator("span.text-primary");
    await expect(brand).toHaveText(locale === "ar" || locale === "ary" ? "إݣودار" : "IGUDAR");
    await expect(brand).toHaveCSS("font-style", "italic");
    await expect(brand).toHaveCSS("font-family", displayFont);
    const bodyFont = await page.locator("body").evaluate((node) => getComputedStyle(node).fontFamily);
    await expect(page.locator("[data-faq-item] h3 button").first()).toHaveCSS("font-family", bodyFont);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `test-results/faq-typography-${locale}-${info.project.name}.png` });
  });
}
