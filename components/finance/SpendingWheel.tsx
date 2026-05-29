'use client';

// Radial month-spend breakdown by category. Center = month total (k);
// right = top-5 categories with their share. Segment palette is drawn from the
// existing token hues (accent / cyan / warning / negative / …).
const COLORS = ['#5B8CFF', '#46E0D0', '#FFB454', '#FF6B7A', '#9B7CFF', '#3FD37E', '#FF95A4'];

export function SpendingWheel({ breakdown, total }: { breakdown: [string, number][]; total: number }) {
  const size = 140;
  const r = 56;
  const stroke = 18;
  const c = 2 * Math.PI * r;

  let offset = 0;
  const segs = breakdown.map(([cat, val], i) => {
    const frac = total ? val / total : 0;
    const len = c * frac;
    const seg = { cat, val, frac, color: COLORS[i % COLORS.length], offset, len };
    offset += len;
    return seg;
  });

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-alt)" strokeWidth={stroke} fill="none" />
          {segs.map((s) => (
            <circle
              key={s.cat}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.len} ${c}`}
              strokeDashoffset={-s.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-[9px] uppercase tracking-[0.14em] text-[var(--text-subtle)]">Месяц</div>
            <div className="num text-[18px] font-bold">
              {Math.round(total / 1000)}
              <span className="text-[12px] text-[var(--text-muted)]">k</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {segs.slice(0, 5).map((s) => (
          <div key={s.cat} className="flex items-center gap-2.5 text-[13px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
            <span className="flex-1 truncate">{s.cat}</span>
            <span className="num text-[12px] font-semibold text-[var(--text-muted)]">{Math.round(s.frac * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
