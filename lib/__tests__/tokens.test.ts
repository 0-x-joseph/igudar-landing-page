import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  path.resolve(__dirname, "../../app/globals.css"),
  "utf8",
);

const token = (name: string) =>
  new RegExp(`--color-${name}:\s*([^;]+);`, "i").exec(css)?.[1].trim();

describe("IGUDAR dark tokens in globals.css", () => {
  it.each([
    ["background", "#0F0C17"],
    ["foreground", "#F6F4EE"],
    ["card", "#191523"],
    ["card-foreground", "#F6F4EE"],
    ["popover", "#191523"],
    ["popover-foreground", "#F6F4EE"],
    ["primary", "#A06EF7"],
    ["primary-foreground", "#171320"],
    ["secondary", "#252130"],
    ["secondary-foreground", "#A9A5B6"],
    ["muted", "#252130"],
    ["muted-foreground", "#A9A5B6"],
    ["accent", "#261943"],
    ["accent-foreground", "#DBCCFF"],
    ["success", "#40BFAA"],
    ["success-foreground", "#171320"],
    ["success-soft", "#19342F"],
    ["highlight", "#F5C147"],
    ["highlight-foreground", "#171320"],
    ["highlight-soft", "#392E18"],
    ["destructive", "#E3705F"],
    ["destructive-foreground", "#171320"],
    ["destructive-soft", "#3D1F1A"],
    ["border", "#312D3E"],
    ["input", "#6C6388"],
    ["ring", "#A06EF7"],
    ["chart-1", "#A06EF7"],
    ["chart-2", "#40BFAA"],
    ["chart-3", "#6BADC7"],
    ["chart-4", "#F5C147"],
    ["chart-5", "#F4A462"],
  ])("%s is %s", (name, value) => {
    expect(token(name)?.toUpperCase()).toBe(value);
  });

  it("declares a dark color scheme for native controls", () => {
    expect(css).toMatch(/color-scheme:\s*dark/i);
  });

  it("uses the deep violet surface as the accent colour, not the old light one", () => {
    expect(css).not.toMatch(/--color-accent:\s*#F3EEFF/i);
  });

  it("honours prefers-reduced-motion", () => {
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});
