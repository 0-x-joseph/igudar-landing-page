import { expect, test } from "@playwright/test";

// Review screenshots of /faq, /pricing and the home in both colour schemes at 390 and 1280. The site has light
// tokens only, so "dark" is the OS preference being emulated: it must look the same and break nothing.
const OUT =
  "C:/Users/ayman/AppData/Local/Temp/claude/C--Users-ayman-Documents-IGUDAR-IGUDAR-dev/3899c17b-98e1-4f22-9d48-54bb650111f0/scratchpad/landing-shots";
const targets = [
  { path: "/", slug: "home" },
  { path: "/faq", slug: "faq" },
  { path: "/pricing", slug: "pricing" },
];

for (const scheme of ["light", "dark"] as const) {
  for (const { path, slug } of targets) {
    test(`shot ${slug}, ${scheme}`, async ({ page }, info) => {
      const width = info.project.use.viewport!.width;
      test.skip(width !== 390 && width !== 1280, "review shots are taken at 390 and 1280 only");
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((r) => setTimeout(r, 80));
        }
        window.scrollTo({ top: 0, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 1500));
      });
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(sw, "horizontal scroll").toBeLessThanOrEqual(width);
      await page.screenshot({ path: `${OUT}/${slug}-${width}-${scheme}.png`, fullPage: true });
    });
  }
}

test("reduced motion: nothing is hidden waiting for an animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/pricing");
  await page.waitForLoadState("networkidle");
  const card = page.locator('[data-plan="family"]');
  await expect(card).toBeVisible();
  await expect(card).toHaveCSS("opacity", "1");
  await expect(card.locator("[data-figure=irr]")).toContainText("%");
});
