import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StrictMode } from "react";
import { fireEvent, render } from "@testing-library/react";
import { isReloadNavigation, readScrollPosition, trackScrollPosition } from "@/lib/scroll-position";

const mockPath = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => mockPath.current }));
import ScrollToTop from "@/components/ScrollToTop";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  window.sessionStorage.clear();
  mockPath.current = "/";
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("tab-local scroll positions", () => {
  it.each(["", "invalid", "NaN", "Infinity", "-10"])("ignores invalid stored position %s", (value) => {
    sessionStorage.setItem("igudar:scroll:/", value);
    expect(readScrollPosition("/")).toBeNull();
  });

  it("keeps languages and anchors separate", () => {
    sessionStorage.setItem("igudar:scroll:/", "1200");
    sessionStorage.setItem("igudar:scroll:/fr#how-it-works", "1600");
    expect(readScrollPosition("/")).toBe(1200);
    expect(readScrollPosition("/fr")).toBeNull();
    window.history.replaceState(null, "", "/fr#how-it-works");
    expect(readScrollPosition("/fr")).toBe(1600);
  });

  it("falls back without throwing when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked"); });
    expect(readScrollPosition("/")).toBeNull();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Blocked"); });
    const stop = trackScrollPosition("/", null);
    expect(() => window.dispatchEvent(new Event("pagehide"))).not.toThrow();
    stop();
  });

  it("flushes the final position on pagehide and stops listening on cleanup", () => {
    const stop = trackScrollPosition("/", null);
    vi.spyOn(window, "scrollY", "get").mockReturnValue(1750);
    window.dispatchEvent(new Event("pagehide"));
    expect(sessionStorage.getItem("igudar:scroll:/")).toBe("1750");
    stop();
    sessionStorage.removeItem("igudar:scroll:/");
    window.dispatchEvent(new Event("pagehide"));
    expect(sessionStorage.getItem("igudar:scroll:/")).toBeNull();
  });

  it("never saves an incoming page's position against the outgoing route", () => {
    sessionStorage.setItem("igudar:scroll:/", "800");
    const stop = trackScrollPosition("/", 800);
    window.history.replaceState(null, "", "/faq");
    window.dispatchEvent(new Event("pagehide"));
    expect(sessionStorage.getItem("igudar:scroll:/")).toBe("800");
    stop();
  });
});

describe("scroll navigation", () => {
  const navigationType = (type: string) => {
    // jsdom has no navigation timing API; provide the browser's entry shape.
    Object.defineProperty(performance, "getEntriesByType", {
      configurable: true, value: () => [{ type }],
    });
  };
  afterEach(() => {
    Reflect.deleteProperty(performance, "getEntriesByType");
  });

  it("recognizes reloads without treating normal arrivals or history as reload", () => {
    navigationType("navigate");
    expect(isReloadNavigation()).toBe(false);
    navigationType("back_forward");
    expect(isReloadNavigation()).toBe(false);
    navigationType("reload");
    expect(isReloadNavigation()).toBe(true);
  });

  it("restores on reload even with repeated StrictMode effects", () => {
    navigationType("reload");
    sessionStorage.setItem("igudar:scroll:/", "1200");
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(4000);
    render(<StrictMode><ScrollToTop /></StrictMode>);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1200, left: 0, behavior: "instant" });
    expect(sessionStorage.getItem("igudar:scroll:/")).toBe("1200");
  });

  it("does not restore stale stored positions on a normal visit", () => {
    navigationType("navigate");
    sessionStorage.setItem("igudar:scroll:/", "1200");
    render(<ScrollToTop />);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("starts ordinary page changes at the top", () => {
    const { rerender } = render(<ScrollToTop />);
    window.history.pushState(null, "", "/faq");
    mockPath.current = "/faq";
    rerender(<ScrollToTop />);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
  });

  it("does not fight Back/Forward or anchor navigation", () => {
    const { rerender } = render(<ScrollToTop />);
    window.history.pushState(null, "", "/faq");
    window.dispatchEvent(new PopStateEvent("popstate"));
    mockPath.current = "/faq";
    rerender(<ScrollToTop />);
    expect(window.scrollTo).not.toHaveBeenCalled();
    window.history.pushState(null, "", "/#how-it-works");
    mockPath.current = "/";
    rerender(<ScrollToTop />);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("restores saved positions on a client-side history visit", () => {
    const { rerender } = render(<ScrollToTop />);
    sessionStorage.setItem("igudar:scroll:/faq", "1000");
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(4000);
    window.history.pushState(null, "", "/faq");
    window.dispatchEvent(new PopStateEvent("popstate"));
    mockPath.current = "/faq";
    rerender(<ScrollToTop />);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1000, left: 0, behavior: "instant" });
  });

  it("cancels reload restoration as soon as the visitor interacts", () => {
    navigationType("reload");
    sessionStorage.setItem("igudar:scroll:/", "1200");
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(4000);
    render(<ScrollToTop />);
    vi.mocked(window.scrollTo).mockClear();
    fireEvent.wheel(window);
    expect(sessionStorage.getItem("igudar:scroll:/")).toBe(String(window.scrollY));
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
