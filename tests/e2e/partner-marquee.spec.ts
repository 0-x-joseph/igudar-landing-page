import { expect, test, type Page } from "@playwright/test";

async function seekLoop(page: Page, milliseconds: number) {
  return page.locator("[data-marquee-track]").evaluate(async (track, time) => {
    const animation = track.getAnimations()[0];
    if (!animation) throw new Error("Partner marquee animation is missing");
    animation.pause();
    animation.currentTime = time;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const windowBounds = track.parentElement!.getBoundingClientRect();
    const sets = Array.from(track.querySelectorAll<HTMLElement>("[data-marquee-set]"));
    const logos = Array.from(track.querySelectorAll<HTMLImageElement>("img"));
    const visible = logos.filter((logo) => {
      const plate = logo.parentElement!.getBoundingClientRect();
      return plate.right > windowBounds.left + 1 && plate.left < windowBounds.right - 1;
    });
    return {
      loaded: visible.every((logo) => logo.complete && logo.naturalWidth > 0),
      count: visible.length,
      setWidths: sets.map((set) => set.getBoundingClientRect().width),
      windowWidth: windowBounds.width,
      firstSource: visible[0]?.getAttribute("src"),
    };
  }, milliseconds);
}

for (const route of ["/", "/fr", "/ar", "/ary"]) {
  test(`partner logos stay visible throughout the loop on ${route}`, async ({ page }, info) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const region = page.locator(".marquee-window");
    await region.scrollIntoViewIfNeeded();
    await expect(region).toHaveAttribute("dir", "ltr");
    await expect(region.getByRole("button")).toHaveCount(0);
    await expect(page.locator(".marquee-toggle")).toHaveCount(0);
    await expect.poll(() => page.locator("[data-marquee-track] img").evaluateAll((images) =>
      images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0),
    )).toBe(true);

    for (const phase of [0, 10_500, 21_000, 31_500, 41_999, 42_000, 63_000, 84_000]) {
      const state = await seekLoop(page, phase);
      expect(state.count, `visible logos at ${phase}ms`).toBeGreaterThan(0);
      expect(state.loaded, `loaded logos at ${phase}ms`).toBe(true);
      expect(state.setWidths).toHaveLength(2);
      expect(Math.abs(state.setWidths[0] - state.setWidths[1])).toBeLessThan(1);
      expect(state.setWidths[0]).toBeGreaterThanOrEqual(state.windowWidth);
    }
    const before = await seekLoop(page, 41_999);
    const after = await seekLoop(page, 42_000);
    expect(before.firstSource).toBe(after.firstSource);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `test-results/partners-${route === "/" ? "en" : route.slice(1)}-${info.project.name}.png` });
  });
}

test("the logo strip still pauses on hover and keyboard focus without a button", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const region = page.locator(".marquee-window");
  const track = page.locator("[data-marquee-track]");
  await region.scrollIntoViewIfNeeded();
  await region.hover();
  await expect(track).toHaveCSS("animation-play-state", "paused");
  await page.mouse.move(0, 0);
  await expect(track).toHaveCSS("animation-play-state", "running");
  await region.focus();
  await expect(track).toHaveCSS("animation-play-state", "paused");
});

test("reduced motion shows all six logos once in a static wrapped list", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ar");
  await page.waitForLoadState("networkidle");
  const region = page.locator(".marquee-window");
  await region.scrollIntoViewIfNeeded();
  const track = page.locator("[data-marquee-track]");
  await expect(track).toHaveCSS("animation-name", "none");
  await expect(page.locator("[data-marquee-set='b']")).toBeHidden();
  await expect(region.locator("img:visible")).toHaveCount(6);
  expect(await region.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
});
