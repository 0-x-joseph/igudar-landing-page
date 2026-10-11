import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  path.resolve(__dirname, "../../app/globals.css"),
  "utf8",
);

const token = (name: string) =>
  new RegExp(`--color-${name}:\s*([^;]+);`, "i").exec(css)?.[1].trim();

describe("IGUDAR light tokens in globals.css", () => {
  it.each([
    ["background", "#FFFFFF"],
    ["foreground", "#17131F"],
    ["card", "#FFFFFF"],
    ["muted", "#EDE9DF"],
    ["muted-foreground", "#615D6E"],
    ["border", "#E2DDD2"],
    ["primary", "#5D18E9"],
    ["accent", "#F3EEFF"],
    ["accent-foreground", "#4A13BA"],
    ["success", "#207F72"],
    ["highlight", "#ECA72C"],
    ["destructive", "#C1402A"],
    ["ring", "#5D18E9"],
    ["surface-sand", "#F7F5EF"],
    ["surface-mist", "#F1EBFD"],
    ["surface-clay", "#FAF4E4"],
  ])("%s is %s", (name, value) => {
    expect(token(name)?.toUpperCase()).toBe(value);
  });

  it("no longer uses violet as the accent colour", () => {
    expect(css).not.toMatch(/--color-accent:\s*#5D18E9/i);
  });

  it("honours prefers-reduced-motion", () => {
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});
