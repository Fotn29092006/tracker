'use client';

import { motion } from 'framer-motion';
import { Delete, ScanFace } from 'lucide-react';
import { haptics } from '@/lib/haptics';
import { PIN_LENGTH } from '@/lib/lock';
import { cn } from '@/lib/utils';

// Reusable numeric keypad with dot indicators. Used by the lock screen and
// the PIN setup sheet.
export function PinPad({
  value,
  onChange,
  error,
  onBiometric,
  title,
  subtitle,
}: {
  value: string;
  onChange: (next: string) => void;
  error?: boolean;
  onBiometric?: () => void;
  title?: string;
  subtitle?: string;
}) {
  const press = (d: string) => { if (value.length < PIN_LENGTH) { haptics.soft(); onChange(value + d); } };
  const back = () => { haptics.soft(); onChange(value.slice(0, -1)); };

  return (
    <div className="flex flex-col items-center">
      {title && <p className="text-[19px] font-semibold">{title}</p>}
      {subtitle && <p className="text-[14px] text-[var(--text-muted)]">{subtitle}</p>}

      {/* dots */}
      <motion.div
        className="flex gap-3.5 my-7"
        animate={error ? { x: [0, -9, 9, -7, 7, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            style={i < value.length && !error ? { boxShadow: '0 0 10px 1px var(--accent-glow)' } : undefined}
            className={cn(
              'h-3.5 w-3.5 rounded-full border-2 transition-colors',
              i < value.length
                ? error ? 'bg-[var(--negative)] border-[var(--negative)]' : 'bg-[var(--accent)] border-[var(--accent)]'
                : 'border-[var(--border-strong)]',
            )}
          />
        ))}
      </motion.div>

      {/* keypad */}
      <div className="grid grid-cols-3 gap-3.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <KeyBtn key={d} onClick={() => press(d)}>{d}</KeyBtn>
        ))}
        {onBiometric ? (
          <KeyBtn onClick={() => { haptics.tap(); onBiometric(); }} ghost aria-label="Face ID">
            <ScanFace size={26} />
          </KeyBtn>
        ) : <span />}
        <KeyBtn onClick={() => press('0')}>0</KeyBtn>
        {value.length > 0 ? (
          <KeyBtn onClick={back} ghost aria-label="Стереть"><Delete size={24} /></KeyBtn>
        ) : <span />}
      </div>
    </div>
  );
}

function KeyBtn({ children, onClick, ghost, ...rest }: { children: React.ReactNode; onClick: () => void; ghost?: boolean } & React.AriaAttributes) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      className={cn(
        'h-[72px] w-[72px] rounded-full grid place-items-center text-[26px] font-medium select-none',
        ghost ? 'text-[var(--text-muted)]' : 'bg-[var(--surface-alt)] text-[var(--text)] active:bg-[var(--surface-raised)]',
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
