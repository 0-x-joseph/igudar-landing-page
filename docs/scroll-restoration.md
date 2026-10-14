# Refresh and language-switch scroll restoration

`components/ScrollToTop.tsx` manages the site's navigation scrolling through
`lib/scroll-position.ts`:

- Scroll positions are saved in `sessionStorage`, keyed by the actual pathname
  (including language), query string and anchor. Only a numeric position is
  stored; nothing is sent to analytics or persisted across browser sessions.
- Refresh resumes the saved position instantly. Back/Forward page changes also
  use the saved view instead of being forced to the top.
- Language switches carry a one-time bookmark to the translated view using
  `lib/language-scroll-position.ts`: the current section's id (or structural
  index) and relative progress below the fixed navigation bar. This adapts to
  translated text height, banner height and RTL layout instead of copying a
  pixel offset. Footer/top/bottom positions also remain in place.
- The language switch remains a full navigation so `<html lang dir>` updates
  correctly. Bookmarks expire after one minute, are matched to the exact
  destination, and are consumed after restoration or user cancellation.
  If a section is unavailable, relative page progress is the fallback. No
  localized text, form values or personal data are stored in the bookmark.
- Normal page links still start at the top. New anchor links still scroll to
  their target. A reload with an old anchor resumes the last position, not the
  anchor's original position; the navbar's delayed jump respects this.
- Restoration retries while fonts/images and document height settle, bounded
  to three seconds. A shorter document clamps to its available height. Wheel,
  touch, pointer or keyboard interaction cancels restoration immediately.
- Scroll writes are frame-throttled and flushed on `pagehide`/hidden documents.
  Listeners and animation frames are cleaned up on route changes and unmount.
- Blocked/full storage and invalid saved values fall back without breaking
  navigation. No global `history.scrollRestoration` override is installed.

Tests: `lib/__tests__/scroll-position.test.tsx` and
`tests/e2e/scroll-restoration.spec.ts`. Browser coverage includes all four
languages, viewport sizes 390/768/1280/1600, refresh with an anchor, refresh at
the top, normal navigation, history navigation and blocked storage. Language
bookmark tests are in `lib/__tests__/language-scroll-position.test.tsx` and
`tests/e2e/language-scroll-restoration.spec.ts`.
