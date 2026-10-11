import { expect, test, type Page } from "@playwright/test";

const pages = [
  { path: "/", slug: "home" },
  { path: "/simulator", slug: "simulator" },
  { path: "/calculator", slug: "calculator" },
  { path: "/faq", slug: "faq" },
  { path: "/pricing", slug: "pricing" },
  { path: "/beta", slug: "beta" },
];
const NOTICE = "Indicative simulation based on the IGUDAR financial model";
const FEE_ROWS = 8;

/** Visible elements whose right edge sits past the viewport: content that body overflow-x: hidden would hide. */
async function offscreenOffenders(page: Page) {
  return page.evaluate(() => {
    const iw = window.innerWidth;
    const out: string[] = [];
    for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
      // The partner marquee scrolls inside its own overflow-hidden region.
      if (el.closest('[aria-hidden="true"], .sr-only, [data-nextjs-toast], nextjs-portal, [role="region"][aria-label="Partner logos"]')) continue;
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

test("a page change lands at the top, not where the footer link was", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  await page.locator("footer").getByRole("link", { name: "FAQ" }).click();
  await page.waitForURL("**/faq");
  await page.waitForLoadState("networkidle");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  // still at the top once any smooth scrolling would have finished
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

for (const { path, slug } of pages) {
  test(`page ${path}`, async ({ page }, info) => {
    const width = info.project.use.viewport!.width;
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    if (path === "/" || path === "/simulator" || path === "/calculator" || path === "/pricing" || path === "/beta") {
      await expect(page.getByText(NOTICE).first()).toBeVisible();
    }
    // The pre-licence sentence is also in every footer.
    await expect(page.locator("footer").getByText(NOTICE)).toHaveCount(1);
    await expect(page.getByText(/sharia|halal|certified/i).filter({ hasNotText: /Sharia board review in progress|Is IGUDAR Sharia-compliant/ })).toHaveCount(0);
    if (path === "/") {
      await expect(page.getByText("1,122.51 MAD").first()).toBeVisible();
      await expect(page.getByText("4,246.26 MAD").first()).toBeVisible();

      // Hero: sand headline, arch-framed visual, simulator right below.
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toContainText("Real property. Real rent.");
      await expect(h1).not.toContainText("wealth");
      await expect(page.getByRole("link", { name: "Beta access" }).first()).toHaveAttribute("href", "https://app.igudar.tech/auth/register");
      await expect(page.getByRole("link", { name: "Apply for the beta" }).first()).toHaveAttribute("href", "/beta");
      await expect(page.getByRole("heading", { name: "Programmes & partners" })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Own real, rented property alongside professionals/ })).toBeVisible();
      await expect(page.locator("main img[alt^='Aerial view']")).toHaveCount(1);

      // New section flow: the igudar story, the money flow, the three honest facts, the CTA.
      await expect(page.locator("#how-it-works")).toHaveCount(1);
      await expect(page.locator("#how-your-money-moves")).toHaveCount(1);
      await expect(page.getByRole("heading", { name: "Three things to know before anything else" })).toHaveCount(1);
      const cta = page.locator("#waitlist-cta");
      await expect(cta.getByRole("link", { name: "Apply for beta" })).toBeVisible();
      await expect(cta.getByRole("button", { name: "Join the waitlist" })).toBeVisible();
      await expect(cta.getByRole("link")).toHaveCount(1);
      await expect(cta.getByRole("button")).toHaveCount(1);
      await expect(page.getByText(/indicative net cash yield/)).toHaveCount(0);
      await expect(page.getByText("Invest now", { exact: false })).toHaveCount(0);
      expect(await page.locator("[data-zellige-band]").count(), "ZelligeBand dividers").toBeGreaterThanOrEqual(2);
    }
    if (path === "/beta") {
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Try IGUDAR with demo money.");
      await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "8");
      await expect(page.getByText("up to a year of activity in about two weeks")).toBeVisible();
      expect(await page.locator("[data-zellige-band]").count(), "ZelligeBand dividers").toBeGreaterThanOrEqual(2);
      await expect(page.getByRole("link", { name: "Access the demo" })).toHaveAttribute(
        "href",
        "https://app.igudar.tech/auth/register",
      );

      // Form: consent is never pre-checked, and an empty submit shows inline errors without calling the API.
      await expect(page.getByRole("list", { name: "How it works" }).getByRole("listitem")).toHaveCount(3);
      const form = page.getByRole("form", { name: "Apply for the beta" });
      const submit = form.getByRole("button", { name: "Apply for the beta" });
      const consent = form.getByRole("checkbox");
      await expect(consent).not.toBeChecked();
      let posts = 0;
      let mode: "ok" | "unconfigured" = "unconfigured";
      let posted: Record<string, unknown> | null = null;
      await page.route("**/api/waitlist", async (route) => {
        posts += 1;
        posted = route.request().postDataJSON();
        if (mode === "unconfigured") await route.fulfill({ status: 503, json: { error: "Sign-up is not configured yet." } });
        else await route.fulfill({ json: { success: true } });
      });
      await submit.click();
      await expect(form.getByText("Please tell us your first name.")).toBeVisible();
      await expect(form.getByText("Please tick the box to agree before applying.")).toBeVisible();
      expect(posts).toBe(0);
      expect((await submit.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await form.getByLabel("First name", { exact: true }).fill("Salma");
      await form.getByLabel("Email", { exact: true }).fill("salma@example.com");
      await form.getByLabel("City and country").fill("Paris, France");
      await form.getByLabel(/realistically consider/).selectOption("25-50k");
      await form.getByLabel(/experience with property/).selectOption("some");
      await consent.check();

      // Not configured: the form shows the server sentence and stays usable.
      await submit.click();
      await expect(form.getByRole("alert")).toHaveText("Sign-up is not configured yet.");
      expect(posts).toBe(1);

      // Configured: success state with the next step.
      mode = "ok";
      await submit.click();
      await expect(page.getByText("Thanks — a founder reviews every application by hand.")).toBeVisible();
      await expect(page.getByRole("link", { name: "Create your account" })).toHaveAttribute(
        "href",
        "https://app.igudar.tech/auth/register",
      );
      expect(posted).toMatchObject({ source: "beta", firstName: "Salma", ticketBucket: "25-50k", experience: "some" });
    }
    if (path === "/calculator") {
      for (const gone of ["Who pays what", "Early exit calculator", "Caps checker"]) {
        await expect(page.getByRole("heading", { name: gone })).toHaveCount(0);
      }
      await expect(page.getByRole("spinbutton", { name: "Your amount" })).toBeVisible();
    }
    if (path === "/simulator") {
      await expect(page.getByText("Your cash, year by year")).toHaveCount(0);
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
