// Launch splash — the app logo on the page background. Shown while the cache
// restores (providers) and while the auth check resolves (AuthGuard), so cold
// start goes splash → content with no blank/skeleton flash in between.
export function Splash() {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-[var(--bg)]">
      <span className="grid h-14 w-14 place-items-center rounded-[18px]" style={{ backgroundImage: 'var(--accent-grad)' }}>
        <span className="flex items-end gap-[3px] pb-1">
          <i className="block h-2.5 w-1 rounded-sm bg-[#07101F]" />
          <i className="block h-4 w-1 rounded-sm bg-[#07101F]" />
          <i className="block h-5 w-1 rounded-sm bg-[#07101F]" />
        </span>
      </span>
    </div>
  );
}
