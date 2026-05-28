'use client';

import { Chip } from './Pill';
import { todayISO, tomorrowISO, addDaysISO, fmtDateLabel } from '@/lib/utils';
import { haptics } from '@/lib/haptics';

// Quick-pick date control: chips + a native picker. value is ISO date | null.
export function DateField({
  value,
  onChange,
  clearable = true,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  clearable?: boolean;
}) {
  const today = todayISO();
  const presets: { label: string; iso: string }[] = [
    { label: 'Сегодня', iso: today },
    { label: 'Завтра', iso: tomorrowISO() },
    { label: 'Неделя', iso: addDaysISO(7) },
  ];
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Chip key={p.iso} active={value === p.iso} onClick={() => onChange(p.iso)}>
            {p.label}
          </Chip>
        ))}
        {clearable && (
          <Chip active={value === null} onClick={() => { haptics.soft(); onChange(null); }}>
            Без даты
          </Chip>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="flex-1 rounded-[12px] bg-[var(--input)] border border-[var(--border)] px-3.5 py-2.5 text-[15px] outline-none focus:border-[var(--accent)]"
        />
        {value && (
          <span className="text-[13px] text-[var(--text-muted)] whitespace-nowrap">{fmtDateLabel(value)}</span>
        )}
      </div>
    </div>
  );
}
