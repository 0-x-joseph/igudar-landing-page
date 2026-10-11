import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Compliance copy guard: no Sharia / halal claim before the Sharia board opinion, no 1,000 MAD
 * minimum, no solicitation, no return promise. Scans shipped source only (tests are excluded so
 * they can name the forbidden phrases).
 */
const ROOT = path.resolve(import.meta.dirname, "..", "..");
const DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx", ".css", ".md", ".mdx", ".json"]);

const FORBIDDEN: [string, RegExp][] = [
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
 * The only Sharia wording allowed, and only in the FAQ: the honest in-progress answer approved in
 * docs/copy-changes.md. Anything else with that word still fails.
 */
const SHARIA_ALLOWED_FILE = "app/faq/page.tsx";
const SHARIA_ALLOWED_PHRASES = ["Is IGUDAR Sharia-compliant?", "Sharia board review in progress"];

function scrub(rel: string, line: string): string {
  if (rel !== SHARIA_ALLOWED_FILE) return line;
  return SHARIA_ALLOWED_PHRASES.reduce((acc, phrase) => acc.split(phrase).join(""), line);
}

const files = DIRS.flatMap((d) => walk(path.join(ROOT, d)));

describe("copy guard", () => {
  it("scans the real source tree", () => {
    expect(files.length).toBeGreaterThan(40);
    expect(files.some((f) => f.endsWith("SiteFooter.tsx"))).toBe(true);
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

  it("the Sharia allowance is narrow: approved phrases only, FAQ only", () => {
    const sharia = FORBIDDEN[0][1];
    expect(sharia.test(scrub(SHARIA_ALLOWED_FILE, "Is IGUDAR Sharia-compliant?"))).toBe(false);
    expect(sharia.test(scrub(SHARIA_ALLOWED_FILE, "Sharia board review in progress"))).toBe(false);
    expect(sharia.test(scrub(SHARIA_ALLOWED_FILE, "100% Sharia compliant"))).toBe(true);
    expect(sharia.test(scrub("components/SiteFooter.tsx", "Sharia board review in progress"))).toBe(true);
    expect(sharia.test(scrub(SHARIA_ALLOWED_FILE, "Halal"))).toBe(false); // halal has its own pattern
  });

  it("the regexes still catch what they are meant to catch", () => {
    const g = FORBIDDEN.find(([l]) => l.startsWith("guaranteed"))![1];
    expect(g.test("a return is guaranteed")).toBe(true);
    expect(g.test("returns are not guaranteed")).toBe(false);
    expect(g.test("guaranteed by the state")).toBe(false);
    const m = FORBIDDEN.find(([l]) => l.startsWith("1,000"))![1];
    expect(m.test("from 1,000 MAD")).toBe(true);
    expect(m.test("from 1000 MAD")).toBe(true);
    expect(m.test("from 25,000 MAD")).toBe(false);
    expect(m.test("1,000,000 MAD all platforms")).toBe(false);
  });
});
