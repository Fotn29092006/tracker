'use client';

import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ease } from '@/lib/motion';
import { haptics } from '@/lib/haptics';
import { Portal } from './Portal';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Extra footer pinned below the scroll area (e.g. submit button). */
  footer?: React.ReactNode;
};

export function Sheet({ open, onClose, title, children, footer }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Lift the sheet above the on-screen keyboard. `dvh` doesn't shrink for the
  // keyboard, so without this the footer (Save) sits behind it. The VisualViewport
  // gives the real keyboard height; we pad the bottom by it (animated).
  const [kb, setKb] = useState(0);
  useEffect(() => {
    if (!open) { setKb(0); return; }
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => setKb(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    onResize();
    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
    };
  }, [open]);

  // Lock the document scroll (the page now scrolls naturally) so the background
  // can't move under the sheet.
  useEffect(() => {
    if (!open) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = 'hidden';
    return () => { el.style.overflow = prev; };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Focus management: move focus into the sheet on open, trap Tab within it,
  // restore focus to the trigger on close (WCAG dialog semantics).
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panel) return;
      const f = panel.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])',
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 700) {
      haptics.soft();
      onClose();
    }
  };

  return (
    <Portal>
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ paddingBottom: kb, transition: 'padding-bottom 0.25s ease', ['--kb' as string]: `${kb}px` } as React.CSSProperties}
        >
          <motion.div
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Окно'}
            tabIndex={-1}
            className={cn(
              'relative w-full max-w-[560px] mx-auto outline-none',
              'bg-[var(--bg-elev)] border-t border-[var(--border)]',
              'rounded-t-[26px] shadow-[var(--shadow-sheet)]',
              'flex flex-col max-h-[calc(92dvh-var(--kb,0px))]',
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.36, ease: ease.out }}
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
    </AnimatePresence>
    </Portal>
  );
}
