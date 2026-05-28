'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const baseInput =
  'w-full rounded-[14px] bg-[var(--input)] border border-[var(--border)] px-3.5 py-3 ' +
  'text-[16px] text-[var(--text)] placeholder:text-[var(--text-subtle)] ' +
  'outline-none transition-colors focus:border-[var(--accent)]';

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[13px] font-medium text-[var(--text-muted)] mb-1.5">
      {children}
    </span>
  );
}

export function Field({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3.5">
      {label && <Label>{label}</Label>}
      {children}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(baseInput, className)} {...rest} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cn(baseInput, 'resize-none leading-relaxed', className)} {...rest} />;
  },
);

/** Big numeric entry used for money / weight — mono, prominent. */
export const AmountInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function AmountInput({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        inputMode="decimal"
        className={cn(
          'num w-full rounded-[16px] bg-[var(--input)] border border-[var(--border)] px-4 py-3.5',
          'text-[28px] font-semibold text-[var(--text)] placeholder:text-[var(--text-subtle)]',
          'outline-none transition-colors focus:border-[var(--accent)]',
          className,
        )}
        {...rest}
      />
    );
  },
);
