import { expect, test } from "@playwright/test";

// Home page screenshots in both colour schemes, for the founder review. The site has light tokens only,
// so "dark" is the OS preference being emulated: it should look the same, and must not break anything.
for (const scheme of ["light", "dark"] as const) {
  test(`home screenshot, ${scheme}`, async ({ page }, info) => {
    const width = info.project.use.viewport!.width;
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 1200));
    });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw, "horizontal scroll").toBeLessThanOrEqual(width);
    await page.screenshot({ path: `test-results/home-shots/home-${width}-${scheme}.png`, fullPage: true });
  });
}
