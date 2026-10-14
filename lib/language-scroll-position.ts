const KEY = "igudar:language-scroll";
const MAX_AGE_MS = 60_000;

export type LanguageScrollPosition = {
  target: string;
  createdAt: number;
  sectionId: string | null;
  sectionIndex: number;
  sectionProgress: number;
  pageProgress: number;
  atTop: boolean;
  atBottom: boolean;
};

function viewUrl(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function sections(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("main section, main > header, footer"));
}

// Measure the navigation bar, not its expanded mobile language menu. Different
// banner translations can change this offset between English and Arabic.
function readingOffset(): number {
  return Math.max(0, document.querySelector("[data-scroll-navigation]")?.getBoundingClientRect().bottom ?? 0) + 16;
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Called explicitly by the language picker, not by ordinary page links. */
export function prepareLanguageScrollPosition(target: string): void {
  try {
    const url = new URL(target, window.location.href);
    if (url.origin !== window.location.origin) return;
    const readingLine = readingOffset();
    const candidates = sections();
    // Prefer the innermost section intersecting the reading line. Stable ids
    // are used where present; identical translated markup provides the index
    // fallback for unnamed sections. No localized text is stored or matched.
    let sectionIndex = -1;
    for (let i = 0; i < candidates.length; i++) {
      const bounds = candidates[i].getBoundingClientRect();
      if (bounds.height > 0 && bounds.top <= readingLine && bounds.bottom > readingLine) sectionIndex = i;
    }
    const section = candidates[sectionIndex];
    const bounds = section?.getBoundingClientRect();
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const bookmark: LanguageScrollPosition = {
      target: `${url.pathname}${url.search}${url.hash}`,
      createdAt: Date.now(),
      sectionId: section?.id || null,
      sectionIndex,
      sectionProgress: bounds ? clamp((readingLine - bounds.top) / bounds.height) : 0,
      pageProgress: maxTop > 0 ? clamp(window.scrollY / maxTop) : 0,
      atTop: window.scrollY <= 1,
      atBottom: maxTop > 0 && window.scrollY >= maxTop - 1,
    };
    sessionStorage.setItem(KEY, JSON.stringify(bookmark));
  } catch {
    // Language selection must still work when tab storage is blocked or full.
  }
}

/** Non-consuming read: the navbar and StrictMode effects may both inspect it.
 * The restoration loop consumes it on success/cancellation, preventing stale
 * language positions from being reused during later page visits. */
export function readLanguageScrollPosition(): LanguageScrollPosition | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<LanguageScrollPosition> | null;
    if (!value || value.target !== viewUrl() || typeof value.createdAt !== "number" ||
        !Number.isFinite(value.createdAt) || value.createdAt > Date.now() || Date.now() - value.createdAt > MAX_AGE_MS ||
        typeof value.sectionIndex !== "number" || !Number.isInteger(value.sectionIndex) || value.sectionIndex < -1 ||
        (value.sectionId !== null && typeof value.sectionId !== "string") ||
        typeof value.sectionProgress !== "number" || !Number.isFinite(value.sectionProgress) ||
        value.sectionProgress < 0 || value.sectionProgress > 1 ||
        typeof value.pageProgress !== "number" || !Number.isFinite(value.pageProgress) ||
        value.pageProgress < 0 || value.pageProgress > 1 ||
        typeof value.atTop !== "boolean" || typeof value.atBottom !== "boolean") return null;
    return value as LanguageScrollPosition;
  } catch {
    return null;
  }
}

export function languageScrollTop(bookmark: LanguageScrollPosition): number {
  const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  if (bookmark.atTop) return 0;
  if (bookmark.atBottom) return maxTop;
  const candidates = sections();
  const section = (bookmark.sectionId ? candidates.find((node) => node.id === bookmark.sectionId) : undefined)
    ?? candidates[bookmark.sectionIndex];
  const bounds = section?.getBoundingClientRect();
  if (bounds && bounds.height > 0) {
    return Math.max(0, bounds.top + window.scrollY + bounds.height * bookmark.sectionProgress - readingOffset());
  }
  return maxTop * bookmark.pageProgress;
}

export function clearLanguageScrollPosition(bookmark: LanguageScrollPosition): void {
  try {
    const current = readLanguageScrollPosition();
    // Do not erase a newer language selection if navigation overlaps cleanup.
    if (current?.createdAt === bookmark.createdAt && current.target === bookmark.target) sessionStorage.removeItem(KEY);
  } catch {
    // Storage is optional.
  }
}
