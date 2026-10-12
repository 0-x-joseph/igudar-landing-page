import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Compliance copy guard: no Sharia / halal claim before the Sharia board opinion, no 1,000 MAD
 * minimum, no solicitation, no return promise. Scans shipped source and every language's message
 * files (tests are excluded so they can name the forbidden phrases).
 */
const ROOT = path.resolve(import.meta.dirname, "..", "..");
const DIRS = ["app", "components", "lib", "messages"];
const EXTENSIONS = new Set([".ts", ".tsx", ".css", ".md", ".mdx", ".json"]);

const FORBIDDEN: [string, RegExp][] = [
  // English
  ["Sharia", /sharia/i],
  ["halal", /halal/i],
  ["1,000 MAD minimum", /\b1,?000 MAD/i],
  ["invest now", /invest now/i],
  ["start investing", /start investing/i],
  ["3 minutes", /3 minutes/i],
  ["flexible exit", /flexible exit/i],
  ["withdraw anytime", /withdraw anytime/i],
  ["guaranteed (not preceded by 'not', not 'guaranteed by')", /(?<!not )guaranteed(?! by)/i],
  ["passive income", /passive income/i],
  ["build your wealth", /build your wealth/i],
  // French
  ["charia", /charia/i],
  ["garanti (not preceded by 'non', 'pas', 'ni', 'peut')", /(?<!non |pas |ni |non-|peut )garanti/i],
  ["investissez maintenant", /investi(ssez|r) (maintenant|dès maintenant)/i],
  ["commencez à investir", /commence[zr] à investir/i],
  ["revenu passif", /revenus? passifs?/i],
  ["sortie flexible", /sortie flexible/i],
  ["retrait à tout moment", /retir(er|ez) à tout moment/i],
  ["1 000 MAD minimum", /\b1[  .]?000 MAD/],
  // Arabic
  ["الشريعة", /شريعة/],
  ["حلال", /حلال/],
  ["مضمون (not preceded by غير)", /(?<!غير )مضمون/],
  ["استثمر الآن", /استثمر الآن/],
  ["ابدأ الاستثمار", /ابدأ الاستثمار/],
  ["دخل سلبي", /دخل سلبي/],
];

function isTestPath(file: string): boolean {
  const rel = file.split(path.sep).join("/");
  return rel.includes("/__tests__/") || /\.(test|spec)\.[tj]sx?$/.test(rel);
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(path.extname(name)) && !isTestPath(full)) out.push(full);
  }
  return out;
}

/**
 * The only Sharia wording allowed, and only in the FAQ messages: the honest in-progress answer approved in
 * docs/copy-changes.md, in each language. Anything else with that word still fails.
 */
const SHARIA_ALLOWED: Record<string, string[]> = {
  "messages/en/faq.json": ["Is IGUDAR Sharia-compliant?", "Sharia board review in progress"],
  "messages/fr/faq.json": ["IGUDAR est-il conforme à la charia ?", "Examen par le comité charia en cours"],
  "messages/ar/faq.json": ["هل إݣودار متوافق مع الشريعة؟", "مراجعة هيئة الشريعة جارية"],
  "messages/ary/faq.json": ["هل إݣودار متوافق مع الشريعة؟", "مراجعة هيئة الشريعة جارية"],
};

function scrub(rel: string, line: string): string {
  const phrases = SHARIA_ALLOWED[rel];
  if (!phrases) return line;
  return phrases.reduce((acc, phrase) => acc.split(phrase).join(""), line);
}

const files = DIRS.flatMap((d) => walk(path.join(ROOT, d)));

describe("copy guard", () => {
  it("scans the real source tree and the message files", () => {
    expect(files.length).toBeGreaterThan(40);
    expect(files.some((f) => f.endsWith("SiteFooter.tsx"))).toBe(true);
    expect(files.some((f) => f.split(path.sep).join("/").endsWith("messages/ar/faq.json"))).toBe(true);
    expect(files.some((f) => isTestPath(f))).toBe(false);
  });

  it.each(FORBIDDEN)("has no %s", (_label, pattern) => {
    const hits: string[] = [];
    for (const file of files) {
      const lines = readFileSync(file, "utf8").split(/\r?\n/);
      const rel = path.relative(ROOT, file).split(path.sep).join("/");
      lines.forEach((line, i) => {
        if (pattern.test(scrub(rel, line))) hits.push(`${rel}:${i + 1}  ${line.trim().slice(0, 100)}`);
      });
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });

  it("the Sharia allowance is narrow: approved phrases only, FAQ messages only", () => {
    const sharia = FORBIDDEN[0][1];
    const en = "messages/en/faq.json";
    expect(sharia.test(scrub(en, "Is IGUDAR Sharia-compliant?"))).toBe(false);
    expect(sharia.test(scrub(en, "Sharia board review in progress"))).toBe(false);
    expect(sharia.test(scrub(en, "100% Sharia compliant"))).toBe(true);
    expect(sharia.test(scrub("components/SiteFooter.tsx", "Sharia board review in progress"))).toBe(true);
    expect(sharia.test(scrub(en, "Halal"))).toBe(false); // halal has its own pattern
    const charia = FORBIDDEN.find(([l]) => l === "charia")![1];
    expect(charia.test(scrub("messages/fr/faq.json", "IGUDAR est-il conforme à la charia ?"))).toBe(false);
    expect(charia.test(scrub("messages/fr/home.json", "conforme à la charia"))).toBe(true);
  });

  it("the regexes still catch what they are meant to catch", () => {
    const g = FORBIDDEN.find(([l]) => l.startsWith("guaranteed"))![1];
    expect(g.test("a return is guaranteed")).toBe(true);
    expect(g.test("returns are not guaranteed")).toBe(false);
    expect(g.test("guaranteed by the state")).toBe(false);
    const fr = FORBIDDEN.find(([l]) => l.startsWith("garanti"))![1];
    expect(fr.test("un rendement garanti")).toBe(true);
    expect(fr.test("les rendements ne sont pas garantis")).toBe(false);
    expect(fr.test("non garanti")).toBe(false);
    const ar = FORBIDDEN.find(([l]) => l.startsWith("مضمون"))![1];
    expect(ar.test("عائد مضمون")).toBe(true);
    expect(ar.test("العوائد غير مضمونة")).toBe(false);
    const m = FORBIDDEN.find(([l]) => l.startsWith("1,000"))![1];
    expect(m.test("from 1,000 MAD")).toBe(true);
    expect(m.test("from 1000 MAD")).toBe(true);
    expect(m.test("from 25,000 MAD")).toBe(false);
    expect(m.test("1,000,000 MAD all platforms")).toBe(false);
  });
});
