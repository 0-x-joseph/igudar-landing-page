import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MESSAGE_AREAS } from "@/i18n/messages";
import { LOCALES, LOCALE_META, routing } from "@/i18n/routing";
import { formatMadIn, formatPercentIn } from "@/lib/i18n/format";
import { alternatesFor, localizedPath } from "@/lib/i18n/metadata";

const ROOT = path.resolve(import.meta.dirname, "..", "..");

function flatten(value: unknown, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  if (typeof value === "string") {
    out.set(prefix, value);
    return out;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      for (const [key, text] of flatten(v, prefix ? `${prefix}.${k}` : k)) out.set(key, text);
    }
  }
  return out;
}

function readArea(locale: string, area: string): Map<string, string> {
  return flatten(JSON.parse(readFileSync(path.join(ROOT, "messages", locale, `${area}.json`), "utf8")));
}

const PLACEHOLDER = /\{(\w+)(?:,[^}]*)?\}/g;

describe("message files", () => {
  for (const area of MESSAGE_AREAS) {
    it(`${area}: French and Arabic carry every English key, and nothing else`, () => {
      const en = readArea("en", area);
      for (const locale of LOCALES.filter((l) => l !== "en")) {
        const other = readArea(locale, area);
        const missing = [...en.keys()].filter((k) => !other.has(k));
        const extra = [...other.keys()].filter((k) => !en.has(k));
        expect(missing, `${locale}/${area}.json is missing keys`).toEqual([]);
        expect(extra, `${locale}/${area}.json has keys English does not`).toEqual([]);
      }
    });

    it(`${area}: placeholders match across languages`, () => {
      const en = readArea("en", area);
      for (const locale of LOCALES.filter((l) => l !== "en")) {
        const other = readArea(locale, area);
        for (const [key, text] of en) {
          const want = [...text.matchAll(PLACEHOLDER)].map((m) => m[1]).sort();
          const got = [...(other.get(key) ?? "").matchAll(PLACEHOLDER)].map((m) => m[1]).sort();
          expect(got, `${locale}/${area}.json ${key}`).toEqual(want);
        }
      }
    });

    it(`${area}: no empty strings`, () => {
      for (const locale of LOCALES) {
        for (const [key, text] of readArea(locale, area)) {
          expect(text.trim(), `${locale}/${area}.json ${key}`).not.toBe("");
        }
      }
    });
  }
});

describe("routing", () => {
  it("English is unprefixed, the others are prefixed", () => {
    expect(routing.defaultLocale).toBe("en");
    expect(localizedPath("en", "/pricing")).toBe("/pricing");
    expect(localizedPath("fr", "/pricing")).toBe("/fr/pricing");
    expect(localizedPath("ar", "/")).toBe("/ar");
    expect(localizedPath("en", "/")).toBe("/");
  });

  it("hreflang alternates cover every language plus x-default", () => {
    const { languages } = alternatesFor("/faq") as { languages: Record<string, string> };
    expect(languages).toEqual({ en: "/faq", fr: "/fr/faq", ar: "/ar/faq", ary: "/ary/faq", "x-default": "/faq" });
  });

  it("Arabic is right-to-left and uses Moroccan Intl tags", () => {
    expect(LOCALE_META.ar.dir).toBe("rtl");
    expect(LOCALE_META.ar.intl).toBe("ar-MA");
    expect(LOCALE_META.fr.intl).toBe("fr-MA");
  });
});

describe("locale formatting", () => {
  it("formats money per language with Western digits", () => {
    expect(formatMadIn("en", 25000, { decimals: 0 })).toBe("25,000 MAD");
    // CLDR groups Moroccan French and Arabic with a point or a narrow space depending on the ICU build.
    expect(formatMadIn("fr", 25000, { decimals: 0 })).toMatch(/^25[   .]000 MAD$/);
    expect(formatMadIn("ar", 25000, { decimals: 0 })).toMatch(/^25[   ,.]000 درهم$/);
    expect(formatMadIn("ary", 25000, { decimals: 0 })).toBe(formatMadIn("ar", 25000, { decimals: 0 }));
    expect(formatMadIn("fr", Number.NaN)).toBe("—");
  });

  it("formats percentages with the locale's decimal mark", () => {
    expect(formatPercentIn("en", 0.045)).toBe("4.5 %");
    expect(formatPercentIn("fr", 0.045)).toBe("4,5 %");
    expect(formatPercentIn("fr", -0.0001)).toBe("0,0 %");
  });
});
