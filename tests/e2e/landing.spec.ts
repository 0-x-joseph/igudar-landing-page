import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", slug: "home" },
  { path: "/simulator", slug: "simulator" },
  { path: "/calculator", slug: "calculator" },
  { path: "/faq", slug: "faq" },
  { path: "/pricing", slug: "pricing" },
];
const NOTICE = "Indicative simulation based on the IGUDAR financial model";

for (const { path, slug } of pages) {
  test(`page ${path}`, async ({ page }, info) => {
    const width = info.project.use.viewport!.width;
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    if (path === "/" || path === "/simulator" || path === "/calculator") {
      await expect(page.getByText(NOTICE).first()).toBeVisible();
    }
    if (path === "/") {
      await expect(page.getByText("1,122.51 MAD").first()).toBeVisible();
      await expect(page.getByText("4,246.26 MAD").first()).toBeVisible();
    }
    if (path === "/simulator") {
      await page.getByText("Pessimistic", { exact: true }).first().click();
      await expect(page.getByText("bank deposit would have earned more").first()).toBeVisible();
    }

    const overflow = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
    }));
    expect(overflow.sw, "horizontal scroll").toBeLessThanOrEqual(overflow.iw);

    // scroll through so in-view animations (rent bar, charts) have played
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 600));
    });
    await page.screenshot({ path: `test-results/landing/${slug}-${width}.png`, fullPage: true });
  });
}
