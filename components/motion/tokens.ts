/** One motion vocabulary for the whole site: fade-up 12 px, 320 ms, ease-out, 70 ms stagger, 2 px lift. */
export const MOTION = {
  riseY: 12,
  durationS: 0.32,
  staggerS: 0.07,
  liftPx: 2,
  ease: [0, 0, 0.2, 1] as const,
  drawS: 1.1,
} as const;
