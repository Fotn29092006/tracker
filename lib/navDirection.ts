// Tiny module-level signal so the route `template` can slide IN the direction
// of navigation. Stores the signed entrance offset in px: tab taps use a small,
// calm distance; swipe commits pass a larger one so the incoming page reads as a
// continuation of the drag. Set right before router.push; the template reads it
// on mount and resets to 0 (so any other navigation — a plain <Link> — falls
// back to a clean fade).
let offset = 0;

export const navDirection = {
  get: () => offset,
  set: (dir: number, dist = 34) => { offset = dir * dist; },
};
