import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|css)$/.test(name)) out.push(full);
  }
  return out;
}

describe("Tifinagh appears only in the logo asset", () => {
  const files = [...walk(path.join(root, "app")), ...walk(path.join(root, "components"))].filter(
    (f) => !f.includes(`${path.sep}brand${path.sep}`),
  );

  it("no page or section component uses TifinaghMark or Tifinagh text", () => {
    const offenders = files.filter((f) => /TifinaghMark|Tifinagh|[ⴰ-⵿]/.test(readFileSync(f, "utf8")));
    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
  });
});
