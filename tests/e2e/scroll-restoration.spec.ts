import { expect, test, type Page } from "@playwright/test";

async function scrollToAndRemember(page: Page, top: number) {
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(top, 0);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem(
    `igudar:scroll:${location.pathname}${location.search}${location.hash}`,
  ))).toBe(String(top));
}

for (const route of ["/", "/fr", "/ar", "/ary"]) {
  test(`refresh restores ${route} to the saved position`, async ({ page }, info) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    await scrollToAndRemember(page, 1800);
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect.poll(() => page.evaluate(() => Math.abs(window.scrollY - 1800))).toBeLessThanOrEqual(2);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => Math.abs(window.scrollY - 1800))).toBeLessThanOrEqual(2);
    await page.screenshot({ path: `test-results/scroll-${route === "/" ? "en" : route.slice(1)}-${info.project.name}.png` });
  });
}

test("refresh restores even when the URL still contains an old section anchor", async ({ page }) => {
  await page.goto("/#how-it-works");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await scrollToAndRemember(page, 2200);
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect.poll(() => page.evaluate(() => Math.abs(window.scrollY - 2200))).toBeLessThanOrEqual(2);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => Math.abs(window.scrollY - 2200))).toBeLessThanOrEqual(2);
});

test("normal links start at the top instead of restoring the old view", async ({ page }) => {
  await page.goto("/faq");
  await page.waitForLoadState("networkidle");
  await scrollToAndRemember(page, 1200);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.locator("footer").getByRole("link", { name: "FAQ" }).click();
  await page.waitForURL("**/faq");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("a new section link still scrolls to its anchor", async ({ page }, info) => {
  await page.goto("/faq");
  await page.waitForLoadState("networkidle");
  if (info.project.use.viewport!.width < 1024) {
    await page.getByRole("button", { name: /menu/i }).first().click();
  }
  await page.getByRole("button", { name: "How It Works", exact: true }).filter({ visible: true }).click();
  await page.waitForURL("**/#how-it-works");
  await expect.poll(() => page.locator("#how-it-works").evaluate((node) => Math.abs(node.getBoundingClientRect().top)))
    .toBeLessThan(150);
});

test("refresh at the top does not resurrect an older deep scroll", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await scrollToAndRemember(page, 1800);
  await scrollToAndRemember(page, 0);
  await page.reload();
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("Back and Forward retain their own scroll positions", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.locator("footer").scrollIntoViewIfNeeded();
  const homePosition = await page.evaluate(() => Math.round(window.scrollY));
  await page.locator("footer").getByRole("link", { name: "FAQ" }).click();
  await page.waitForURL("**/faq");
  await page.waitForLoadState("networkidle");
  await scrollToAndRemember(page, 1000);
  await page.goBack();
  await page.waitForURL(/\/$/);
  await expect.poll(() => page.evaluate((y) => Math.abs(window.scrollY - y), homePosition)).toBeLessThanOrEqual(2);
  await page.goForward();
  await page.waitForURL("**/faq");
  await expect.poll(() => page.evaluate(() => Math.abs(window.scrollY - 1000))).toBeLessThanOrEqual(2);
});

test("blocked storage does not break page navigation", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException("Storage blocked", "SecurityError"); };
    Storage.prototype.setItem = () => { throw new DOMException("Storage blocked", "SecurityError"); };
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.locator("footer").getByRole("link", { name: "FAQ" }).click();
  await page.waitForURL("**/faq");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
