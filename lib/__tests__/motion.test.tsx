import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Reveal } from "@/components/motion/Reveal";
import { Hover } from "@/components/motion/Hover";
import { DrawPath } from "@/components/motion/DrawPath";
import { MOTION } from "@/components/motion/tokens";

const motionPref = vi.hoisted(() => ({ reduce: false }));
vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => motionPref.reduce,
}));

function prefersReducedMotion(reduce: boolean) {
  motionPref.reduce = reduce;
}

afterEach(() => prefersReducedMotion(false));

describe("motion vocabulary", () => {
  it("is one set of values: 12 px rise, 320 ms, 2 px lift", () => {
    expect(MOTION.riseY).toBe(12);
    expect(MOTION.durationS).toBe(0.32);
    expect(MOTION.liftPx).toBe(2);
  });

  it("Reveal starts hidden and 12 px down when motion is allowed", () => {
    prefersReducedMotion(false);
    render(<Reveal className="r">hello</Reveal>);
    const el = screen.getByText("hello");
    expect(el.style.opacity).toBe("0");
    expect(el.style.transform).toContain("12px");
  });

  it("Reveal renders the plain, visible element under reduced motion", () => {
    prefersReducedMotion(true);
    render(<Reveal className="r">hello</Reveal>);
    const el = screen.getByText("hello");
    expect(el.className).toBe("r");
    expect(el.getAttribute("style")).toBeNull();
  });

  it("Reveal can render a list item", () => {
    prefersReducedMotion(true);
    render(
      <ul>
        <Reveal as="li">row</Reveal>
      </ul>,
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("row");
  });

  it("Hover and DrawPath are no-ops under reduced motion", () => {
    prefersReducedMotion(true);
    const { container } = render(
      <>
        <Hover className="h">card</Hover>
        <svg>
          <DrawPath d="M0 0 L10 10" stroke="red" />
        </svg>
      </>,
    );
    expect(screen.getByText("card").getAttribute("style")).toBeNull();
    const path = container.querySelector("path")!;
    expect(path.getAttribute("style")).toBeNull();
    expect(path.getAttribute("d")).toBe("M0 0 L10 10");
  });

  it("DrawPath starts undrawn until it scrolls into view when motion is allowed", () => {
    prefersReducedMotion(false);
    const { container } = render(
      <svg>
        <DrawPath d="M0 0 L10 10" stroke="red" />
      </svg>,
    );
    expect(container.querySelector("path")!.getAttribute("pathLength")).toBe("1");
    expect(container.querySelector("path")!.getAttribute("stroke-dasharray")).not.toBeNull();
  });
});
