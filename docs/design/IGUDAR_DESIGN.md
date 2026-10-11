# IGUDAR design system

> Shared with the platform repo (same file at the same path). Both products must feel like one brand.

## 1. The idea

The name comes from the *igudar*, the Amazigh collective granaries of the Anti-Atlas: one fortified building, many families, each with its own chamber, a trusted keeper, and written rules everyone agreed to. IGUDAR is the same thing for property: a shared building, individual shares, a regulated keeper, clear rules. (Always say "IGUDAR" / "the igudar" — never name the design after a city.)

So the interface should feel:

| Feel | How |
|---|---|
| **Familial / welcoming** | Warm sand background, greetings by first name, human explanations, gentle celebration moments |
| **Guarded / trustworthy** | Calm layout, generous spacing, precise numbers, visible "why we ask" and "where your data goes" |
| **Moroccan, authentically** | Zellige geometry, the arch, Tifinagh from the logo, earth tones — used with restraint, like a modern riad, not a souvenir shop |
| **Professional** | Robinhood-level clarity: one primary action per screen, big numbers, no clutter, fast |

**Avoid clichés:** no lanterns, camels, tagines, mosque silhouettes, carpet borders everywhere, fake "Arabic-style" Latin fonts, or rainbow multi-colour zellige. Our zellige is **monochrome violet line work** on sand or night.

## 2. Colour (stays on the existing brand chart)

The brand chart is violet + white/sand + ink. Teal and saffron already exist in the chart tokens (`--chart-2`, `--chart-4`) and are reused as the only supporting accents.

### Light — "Pisé" (DEFAULT)

| Token | HSL (Tailwind v3 / shadcn) | Hex (approx) | Use |
|---|---|---|---|
| `--background` | `45 33% 95%` | `#F7F5EF` | App/page background (warm sand) |
| `--card` / `--popover` | `0 0% 100%` | `#FFFFFF` | Cards sit white on sand |
| `--foreground` | `258 25% 10%` | `#17131F` | Ink (warm, not pure black) |
| `--muted` | `42 25% 91%` | `#EDE9DF` | Subtle fills, skeletons |
| `--muted-foreground` | `255 8% 40%` | `#615D6E` | Secondary text |
| `--border` / `--input` | `40 20% 86%` | `#E2DDD2` | Hairlines |
| `--primary` | `259.81 82.61% 50.39%` | `#5D18E9` | **Unchanged brand violet** |
| `--primary-foreground` | `0 0% 100%` | | |
| `--accent` | `258 100% 97%` | `#F3EEFF` | Violet tint for selected rows, chips |
| `--accent-foreground` | `259 79% 41%` | `#4A13BA` | |
| `--success` (new) | `173 58% 30%` | `#207F72` | "Zellige green" — confirmed, verified, positive delta |
| `--highlight` (new) | `40 85% 55%` | `#ECA72C` | Saffron — badges, rosette centre, celebrations. **Never as text on light** |
| `--destructive` | `8 68% 45%` | `#C1402A` | Terracotta red |
| `--ring` | = primary | | |

### Dark — "Nuit" (opt-in)

| Token | HSL | Hex (approx) |
|---|---|---|
| `--background` | `255 30% 7%` | `#0F0C17` |
| `--card` / `--popover` | `255 24% 11%` | `#18151F` |
| `--foreground` | `40 30% 95%` | `#F6F3EC` (warm off-white) |
| `--muted` | `255 18% 16%` | |
| `--muted-foreground` | `255 10% 68%` | |
| `--border` / `--input` | `255 16% 21%` | |
| `--primary` | `262 90% 66%` | `#8B5CF6`-ish (lighter violet for contrast) |
| `--accent` | `259 45% 20%` | |
| `--success` | `170 50% 50%` | |
| `--highlight` | `42 90% 62%` | |
| `--destructive` | `8 70% 58%` | |

These are starting values. **Verify every text/background pair for WCAG AA in both themes** with a small script and adjust lightness only (keep hues).

Landing page (Tailwind v4): express the same values in `@theme` as hex (`--color-background: #F7F5EF;` etc.). Same names where possible.

## 3. Light / dark theme behaviour (platform)

- `next-themes` is already installed. Wrap the app in `ThemeProvider` with `attribute="class"`, `defaultTheme="light"`, `enableSystem` **on** but default **light** (users choose Light / Dark / System in Settings).
- `suppressHydrationWarning` on `<html>` so there is no flash.
- Toggle: a sun/moon icon button in the top bar (next to the bell), plus a 3-way segmented control in Settings › Appearance. Both stay in sync.
- `theme-color` meta follows the theme (sand in light, night in dark).
- Charts (Recharts) read colours from CSS variables, not hard-coded hex, so they switch with the theme.
- Landing page: light only for now (marketing). Use the same tokens so a dark version is possible later.

## 4. Typography

Today the two repos disagree (platform: Public Sans + Barlow Semi Condensed; landing: Inter + Playfair Display). Propose **one pair for both** and ask the founders before switching:

- **UI / body:** keep one neutral humanist sans (Public Sans or Inter — pick one for both repos).
- **Display (greetings, hero titles, big moments only):** a warm high-contrast serif that echoes the logo wordmark, e.g. Fraunces or Playfair Display. Never for numbers, forms or tables.
- **Numbers:** sans with `tabular-nums` (`.financial-number`). Big portfolio figures can be large and bold, Robinhood-style.
- **Arabic (future):** IBM Plex Sans Arabic or Noto Kufi Arabic. Keep layouts RTL-ready now.

## 5. Motifs — where and how

All motifs live in `components/brand/` and are pure SVG/CSS (no image files, so they theme and scale). Each accepts `className` and uses `currentColor`.

### 5.1 `<ZelligePattern />` — the texture

An original 8-fold star-and-cross line pattern (khatam geometry is traditional and public-domain; draw our own construction, don't trace a photographed tile).

Rules:
- Monochrome: violet line work only (`text-primary`), stroke 1px.
- Opacity: **4–7 % in light, 6–10 % in dark.** If you notice it at first glance, it's too strong.
- Always masked/faded (radial or linear gradient mask) so it dissolves into the surface; never a hard full-bleed wallpaper.
- Never behind numbers, body text, form fields, tables or charts.

Where it goes:
| Place | Treatment |
|---|---|
| Auth pages (login, register, verify) | Side panel (desktop) / top band (mobile) in violet with the pattern at ~10 % in white + Tifinagh mark + one warm sentence |
| Dashboard "Portfolio value" hero card | Pattern in the top-right corner, fading out toward the number |
| Property cards | A thin zellige band along the image's bottom edge, or on the funding progress track |
| Empty states (no investments, no documents) | Small rosette illustration + friendly sentence + one action |
| KYC / onboarding step headers | Pattern band behind the step illustration |
| Section dividers (landing) | One-row tile border, 24px tall, faded at both ends |

Seed implementation (refine visually; keep the API):

```tsx
// components/brand/ZelligePattern.tsx
import { useId } from 'react';

function star(cx: number, cy: number, R: number) {
  const r = R * 0.765; // 8-point star made of two overlapping squares
  return Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
}

export function ZelligePattern({
  size = 48, strokeWidth = 1, className,
}: { size?: number; strokeWidth?: number; className?: string }) {
  const id = useId();
  const s = size, R = s * 0.35;
  const centres = [[s / 2, s / 2], [0, 0], [s, 0], [0, s], [s, s]];
  return (
    <svg aria-hidden="true" className={className} width="100%" height="100%">
      <defs>
        <pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
          {centres.map(([x, y], i) => (
            <polygon key={i} points={star(x, y, R)} fill="none"
              stroke="currentColor" strokeWidth={strokeWidth} />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
```

Usage: `<ZelligePattern className="pointer-events-none absolute inset-0 text-primary opacity-[0.05] dark:opacity-[0.08] [mask-image:radial-gradient(circle_at_top_right,black,transparent_70%)]" />`

### 5.2 `<RosetteProgress steps={8} completed={n} />` — the signature moment

An 8-petal zellige rosette. Each completed onboarding/KYC step fills one petal in violet; the centre turns saffron when all 8 are done ("Your tile is complete"). It replaces generic progress bars in onboarding, KYC and profile completion.
- Accessible: `role="progressbar"` with `aria-valuenow/aria-valuemax` and a text label ("Step 3 of 8").
- Petal fill animates 300 ms ease-out; static under reduced motion.

### 5.3 `<ArchFrame />` — the arch

A pointed/horseshoe arch as a CSS `clip-path` or SVG mask. Use in **max two places**: the property detail hero image and the welcome/onboarding illustration. Optionally the avatar frame on the profile page. Not on every card.

### 5.4 `<TifinaghMark />`

The ⵉⴳⵓⴷⴰⵔ glyphs from the logo, as a decorative accent (auth panel, footer, celebration screen). Always `aria-hidden`; never used as functional text.

## 6. Components & layout

- Radius: cards `1rem` (`--radius: 0.75rem` base), buttons and inputs fully consistent. Softer than today's `0.5rem` = friendlier.
- Cards: white on sand, 1px warm border, almost no shadow (`shadow-sm` max). Dark: card surface + border, no shadow.
- Primary button: solid violet. One per screen section. Secondary: white with border. Tertiary: text.
- Numbers: the main figure on a screen is big (e.g. 40–48px, bold, tabular). Supporting figures small and muted.
- Status colours: success = zellige green, pending = saffron (as a dot/badge, with dark text), error = terracotta. Always paired with an icon or label, never colour alone.
- Density: keep the compact list density already established in PROGRESS.md cycles 4–10.

## 7. Motion

- Calm and purposeful: 150–300 ms, ease-out. No bouncing, no parallax in the app.
- Moments worth animating: rosette petal fill, number count-up on the portfolio card (once per session), card hover lift (2px), theme switch (instant, no long fades).
- Every animation has a `prefers-reduced-motion` fallback.

## 8. Microcopy and "explainers"

The human feel comes mostly from words. Pattern: **what → why → what happens next.**

- **Explainer chip** (`<WhyWeAsk />`): a small "Why do we ask?" link next to sensitive fields that opens a short popover in plain language, with the law named in one line (e.g. "Moroccan anti-money-laundering law (Loi 43-05) requires every platform to confirm who its investors are.").
- **"Good to know" cards** (`<GoodToKnow />`): one-sentence tips that appear at the moment they matter (first property view: "Yields shown are net of tax and fees, and never guaranteed."). Dismissible, remembered per user.
- **Greetings:** "Marhba, Salma 👋" style in the top of the dashboard; time-aware ("Good evening") optional. One greeting, not a banner.
- **Errors:** say what happened and what to do, never blame. "We couldn't read that photo — try again in better light."

Examples (EN / FR):

| Moment | EN | FR |
|---|---|---|
| Welcome | Marhba! Let's set up your account. It takes about 5 minutes. | Marhba ! Configurons votre compte. Cela prend environ 5 minutes. |
| Before ID scan | We need to confirm it's really you. This protects you, and every other investor in the building. | Nous devons confirmer que c'est bien vous. Cela vous protège, vous et tous les autres investisseurs du bien. |
| PEP question | Do you, or a close family member, hold a senior public role? Most people answer no — we ask everyone. | Vous-même ou un proche occupez-vous une fonction publique importante ? La plupart répondent non — nous le demandons à tous. |
| KYC submitted | Your tile is complete. We're reviewing your file — usually within 3 business days. | Votre mosaïque est complète. Nous examinons votre dossier, généralement sous 3 jours ouvrés. |
| Yield label | 4.5 % indicative net cash yield (Base) · not guaranteed | Rendement net indicatif 4,5 % (scénario central) · non garanti |

## 9. Accessibility checklist

AA contrast both themes · visible focus rings (violet, 2px offset) · 44px touch targets · motifs `aria-hidden` · labels on every input · errors linked with `aria-describedby` · keyboard-complete flows · reduced-motion respected.
