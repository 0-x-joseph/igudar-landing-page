import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  prepareLanguageScrollPosition, readLanguageScrollPosition,
  languageScrollTop, clearLanguageScrollPosition,
  type LanguageScrollPosition,
} from "@/lib/language-scroll-position";
import { trackScrollPosition } from "@/lib/scroll-position";

const KEY = "igudar:language-scroll";
const bounds = (top: number, height: number) => ({ top, bottom: top + height, height }) as DOMRect;

function fixture(id = "how-it-works") {
  const { container } = render(<>
    <div data-scroll-navigation="" />
    <main><section id={id}>Translated content</section></main>
  </>);
  const bar = container.querySelector("[data-scroll-navigation]")!;
  const section = container.querySelector("section")!;
  vi.spyOn(bar, "getBoundingClientRect").mockReturnValue(bounds(36, 64));
  const rect = vi.spyOn(section, "getBoundingClientRect").mockReturnValue(bounds(-284, 800));
  return { section, rect };
}

const bookmark: LanguageScrollPosition = {
  target: "/fr", createdAt: 0, sectionId: "how-it-works", sectionIndex: 0,
  sectionProgress: 0.5, pageProgress: 0.25, atTop: false, atBottom: false,
};

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  sessionStorage.clear();
  vi.spyOn(window, "scrollY", "get").mockReturnValue(1000);
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(5000);
});
afterEach(() => vi.restoreAllMocks());

describe("language reading-position bookmarks", () => {
  it("captures the current section and its relative reading position", () => {
    fixture();
    prepareLanguageScrollPosition("/fr");
    expect(JSON.parse(sessionStorage.getItem(KEY)!)).toMatchObject({
      target: "/fr", sectionId: "how-it-works", sectionIndex: 0,
      sectionProgress: 0.5, atTop: false, atBottom: false,
    });
  });

  it("preserves query and hash while matching only the destination view", () => {
    fixture();
    prepareLanguageScrollPosition("/ar?view=details#how-it-works");
    expect(readLanguageScrollPosition()).toBeNull();
    window.history.replaceState(null, "", "/ar?view=details#how-it-works");
    expect(readLanguageScrollPosition()?.target).toBe("/ar?view=details#how-it-works");
  });

  it("maps relative progress into changed section heights and banner geometry", () => {
    const { rect } = fixture();
    vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
    rect.mockReturnValue(bounds(1800, 1200));
    expect(languageScrollTop(bookmark)).toBe(2284); // 1800 + 1200 * .5 - (100 + 16)
  });

  it("prioritizes a language bookmark over an older pixel position in that language", () => {
    const { rect } = fixture();
    prepareLanguageScrollPosition("/");
    const saved = readLanguageScrollPosition()!;
    vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    rect.mockReturnValue(bounds(600, 1000));
    const stop = trackScrollPosition("/", 2500, saved);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 984, left: 0, behavior: "instant" });
    stop();
  });

  it("uses the same translated section index when there is no id", () => {
    const { rect } = fixture("");
    prepareLanguageScrollPosition("/fr");
    const saved = JSON.parse(sessionStorage.getItem(KEY)!) as LanguageScrollPosition;
    expect(saved.sectionId).toBeNull();
    vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
    rect.mockReturnValue(bounds(1500, 1000));
    expect(languageScrollTop(saved)).toBe(1884);
  });

  it("falls back to page progress when the original section cannot be found", () => {
    expect(languageScrollTop({ ...bookmark, sectionIndex: 99 })).toBe((5000 - window.innerHeight) * 0.25);
  });

  it("keeps the beginning and end of a page pinned across translations", () => {
    expect(languageScrollTop({ ...bookmark, atTop: true })).toBe(0);
    expect(languageScrollTop({ ...bookmark, atBottom: true })).toBe(5000 - window.innerHeight);
  });

  it("consumes a valid bookmark without erasing a newer language choice", () => {
    window.history.replaceState(null, "", "/fr");
    const original = { ...bookmark, createdAt: Date.now() - 10 };
    sessionStorage.setItem(KEY, JSON.stringify(original));
    const newer = { ...original, createdAt: Date.now() };
    sessionStorage.setItem(KEY, JSON.stringify(newer));
    clearLanguageScrollPosition(original);
    expect(readLanguageScrollPosition()).toEqual(newer);
    clearLanguageScrollPosition(newer);
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it.each([
    { createdAt: Date.now() - 120_000 }, { createdAt: Number.MAX_SAFE_INTEGER },
    { sectionProgress: 2 }, { pageProgress: -1 }, { sectionIndex: "0" },
    { sectionId: 42 }, { atTop: "yes" },
  ])("ignores corrupt or expired bookmark %j", (overrides) => {
    window.history.replaceState(null, "", "/fr");
    sessionStorage.setItem(KEY, JSON.stringify({ ...bookmark, createdAt: Date.now(), ...overrides }));
    expect(readLanguageScrollPosition()).toBeNull();
  });

  it("ignores malformed JSON and external destinations", () => {
    sessionStorage.setItem(KEY, "not-json");
    expect(readLanguageScrollPosition()).toBeNull();
    sessionStorage.clear();
    prepareLanguageScrollPosition("https://elsewhere.example/fr");
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it("does not prevent language navigation when storage is blocked", () => {
    fixture();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Blocked"); });
    expect(() => prepareLanguageScrollPosition("/fr")).not.toThrow();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked"); });
    expect(readLanguageScrollPosition()).toBeNull();
  });
});
