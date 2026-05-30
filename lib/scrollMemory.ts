// Per-route scroll memory. Native tab apps return you to a tab exactly where you
// left it; route-based pages otherwise jump back to the top on every switch.
// We save the scroll position when a screen unmounts and restore it on return.
const store = new Map<string, number>();

export const scrollMemory = {
  save: (key: string, y: number) => { store.set(key, y); },
  get: (key: string) => store.get(key) ?? 0,
};
