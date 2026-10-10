import { expect, test, type Page } from "@playwright/test";

const pages = [
  { path: "/", slug: "home" },
  { path: "/simulator", slug: "simulator" },
  { path: "/calculator", slug: "calculator" },
  { path: "/faq", slug: "faq" },
  { path: "/pricing", slug: "pricing" },
];
const NOTICE = "Indicative simulation based on the IGUDAR financial model";
const FEE_ROWS = 8;

/** Visible elements whose right edge sits past the viewport: content that body overflow-x: hidden would hide. */
async function offscreenOffenders(page: Page) {
  return page.evaluate(() => {
    const iw = window.innerWidth;
    const out: string[] = [];
    for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
      if (el.closest('[aria-hidden="true"], .sr-only, [data-nextjs-toast], nextjs-portal')) continue;
      // A table that scrolls inside its own card does not scroll the page.
      let clipped = false;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const ox = getComputedStyle(a).overflowX;
        if (ox === "auto" || ox === "scroll") { clipped = true; break; }
      }
      if (clipped) continue;
      const style = getComputedStyle(el);
      if (style.position === "fixed" || style.visibility === "hidden" || style.display === "none") continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > iw + 1 || r.left < -1) {
        out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} [${Math.round(r.left)}..${Math.round(r.right)}]`);
      }
    }
    return out.slice(0, 10);
  });
}

for (const { path, slug } of pages) {
  test(`page ${path}`, async ({ page }, info) => {
    const width = info.project.use.viewport!.width;
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    if (path === "/" || path === "/simulator" || path === "/calculator" || path === "/pricing") {
      await expect(page.getByText(NOTICE).first()).toBeVisible();
    }
    if (path === "/") {
      await expect(page.getByText("1,122.51 MAD").first()).toBeVisible();
      await expect(page.getByText("4,246.26 MAD").first()).toBeVisible();

      // Hero: sand headline, arch-framed visual, simulator right below.
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toContainText("Build your wealth through real");
      await expect(page.getByRole("heading", { name: /Own real, rented property alongside professionals/ })).toBeVisible();
      await expect(page.locator("main img[alt^='Aerial view']")).toHaveCount(1);

      // New section flow: the igudar story, the money flow, the three honest facts, the CTA.
      await expect(page.locator("#how-it-works")).toHaveCount(1);
      await expect(page.locator("#how-your-money-moves")).toHaveCount(1);
      await expect(page.getByRole("heading", { name: "Three things to know before anything else" })).toHaveCount(1);
      await expect(page.getByRole("link", { name: "Simulate", exact: true })).toBeVisible();
      await expect(page.getByText("Invest now", { exact: false })).toHaveCount(0);
      expect(await page.locator("[data-zellige-band]").count(), "ZelligeBand dividers").toBeGreaterThanOrEqual(2);
    }
    if (path === "/simulator") {
      await page.getByText("Pessimistic", { exact: true }).first().click();
      await expect(page.getByText("bank deposit would have earned more").first()).toBeVisible();
    }
    if (path === "/pricing") {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Who pays what, when");
      await expect(page.locator('[data-testid="fee-row"]:visible')).toHaveCount(FEE_ROWS);
      await expect(page.getByText("187.50 MAD").filter({ visible: true }).first()).toBeVisible();
      await expect(
        page.locator('[data-testid="fee-row"]:visible').filter({ hasText: "Entry fee" }),
      ).toContainText("0 MAD");
      await expect(page.getByRole("heading", { name: /What you don.t pay/ })).toBeVisible();
      await expect(page.getByRole("link", { name: /calculator/i }).first()).toHaveAttribute("href", "/calculator");
      await expect(page.getByText("1,000 MAD")).toHaveCount(0);
      expect(await page.locator("[data-zellige-band]").count(), "ZelligeBand dividers").toBeGreaterThanOrEqual(2);
    }

    const overflow = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
    }));
    expect(overflow.sw, "horizontal scroll").toBeLessThanOrEqual(overflow.iw);
    expect(await offscreenOffenders(page), "content past the viewport edge").toEqual([]);

    // scroll through so in-view animations (rent bar, charts) have played
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 600));
    });
    await page.screenshot({ path: `test-results/landing/${slug}-${width}.png`, fullPage: true });
  });
}
