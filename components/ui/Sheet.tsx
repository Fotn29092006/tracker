'use client';

import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { spring } from '@/lib/motion';
import { haptics } from '@/lib/haptics';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Extra footer pinned below the scroll area (e.g. submit button). */
  footer?: React.ReactNode;
};

export function Sheet({ open, onClose, title, children, footer }: Props) {
  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 700) {
      haptics.soft();
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'relative w-full max-w-[560px] mx-auto',
              'bg-[var(--bg-elev)] border-t border-[var(--border)]',
              'rounded-t-[26px] shadow-[var(--shadow-sheet)]',
              'flex flex-col max-h-[92dvh]',
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring.sheet}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
          >
            {/* Grab handle */}
            <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
              <div className="h-1.5 w-10 rounded-full bg-[var(--border-strong)]" />
            </div>

            {title !== undefined && (
              <div className="flex items-center justify-between px-5 pb-2 pt-1">
                <h2 className="text-[19px] font-semibold tracking-tight">{title}</h2>
                <button
                  aria-label="Закрыть"
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="overflow-y-auto overscroll-contain px-5 pt-1 pb-2">
              {children}
            </div>

            {footer && (
              <div className="px-5 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] border-t border-[var(--hairline)]">
                {footer}
              </div>
            )}
            {!footer && <div className="pb-[max(env(safe-area-inset-bottom),12px)]" />}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
