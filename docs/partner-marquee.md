# Continuous partner-logo strip

`components/BackedBySection.tsx` renders the existing six partner/programme
logos twice: one accessible set and an identical decorative copy. The copy is
`aria-hidden` with empty image alt text, so screen readers hear each logo once.

- The pause/play button and its React state are removed. Hovering the region or
  focusing it with the keyboard still pauses the motion; its existing translated
  label and a visible focus outline make the keyboard stop discoverable.
- The visual region uses `dir="ltr"` even on Arabic/Darija pages. This keeps its
  layout direction consistent with the physical leftward CSS animation instead
  of sliding a right-aligned RTL track out of the visible area. The surrounding
  page retains its RTL layout and translated heading.
- The track spans two equal sets, each at least as wide as the viewing region.
  Moving exactly half the track width replaces one complete set with the next
  at each loop boundary. Space is distributed across the logos rather than
  leaving a large empty trailing area.
- Both sets load images eagerly, using the same cached URLs, to avoid empty
  plates when the initially offscreen copies enter view.
- Reduced-motion users see one static, wrapped list with all six logos and no
  edge mask; duplicate logos are hidden.

The change makes the list **continuously looping**, not an outbound-link list.
Partner names, files and existing image treatments are unchanged; no partner
URLs or additional affiliations are invented.

Browser regression checks in `tests/e2e/partner-marquee.spec.ts` seek multiple
animation phases and the wrap boundary, verify loaded visible logos in all four
languages, and cover hover/focus pause plus the reduced-motion layout.
