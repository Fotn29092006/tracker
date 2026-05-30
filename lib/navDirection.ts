// Tiny module-level signal so the route `template` can slide IN the direction
// of navigation. Set by swipe gestures (SwipeNav) and tab taps (TabBar) right
// before router.push; the template reads it on mount and resets it to 0, so any
// other navigation (a plain <Link>) falls back to a clean fade (dir 0).
let dir = 0;

export const navDirection = {
  get: () => dir,
  set: (d: number) => { dir = d; },
};
