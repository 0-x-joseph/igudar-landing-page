import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ArchFrame, RosetteProgress, TifinaghMark, ZelligeBand, ZelligePattern } from "@/components/brand";

describe("brand primitives", () => {
  it("ZelligeBand is decorative: aria-hidden, one 24px row of tiles in currentColor", () => {
    const { container } = render(<ZelligeBand />);
    const band = container.firstElementChild!;
    expect(band).toHaveAttribute("aria-hidden", "true");
    expect(band.className).toContain("h-6");
    expect(container.querySelector("svg")).toHaveAttribute("height", "24");
    expect(container.querySelector("polygon")).toHaveAttribute("stroke", "currentColor");
  });

  it("ZelligePattern is aria-hidden and not focusable", () => {
    const { container } = render(<ZelligePattern className="x" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it("two patterns on one page get distinct ids", () => {
    const { container } = render(
      <>
        <ZelligePattern />
        <ZelligeBand />
      </>,
    );
    const ids = Array.from(container.querySelectorAll("pattern")).map((p) => p.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("ArchFrame renders its child inside an aria-hidden clip definition", () => {
    const { container, getByText } = render(
      <ArchFrame className="aspect-[4/5]">
        <span>property</span>
      </ArchFrame>,
    );
    expect(getByText("property")).toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    const clip = container.querySelector("clipPath")!;
    expect(clip.id).toMatch(/^arch-/);
    expect((container.firstElementChild as HTMLElement).style.clipPath).toContain(clip.id);
  });

  it("TifinaghMark is aria-hidden and has the six glyphs", () => {
    const { container } = render(<TifinaghMark />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll("g[data-letter]")).toHaveLength(6);
  });

  it("RosetteProgress exposes progress and clamps out-of-range input", () => {
    const { getByRole } = render(<RosetteProgress completed={99} steps={8} />);
    expect(getByRole("progressbar")).toHaveAttribute("aria-valuenow", "8");
  });
});
