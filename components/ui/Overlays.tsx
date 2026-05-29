'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { spring } from '@/lib/motion';
import { haptics } from '@/lib/haptics';
import { Button } from './Button';
import { Portal } from './Portal';

// ── Toasts + Confirm, exposed imperatively via useOverlays() ──

type ToastTone = 'success' | 'error' | 'info';
type Toast = { id: number; text: string; tone: ToastTone };

type ConfirmOpts = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type Ctx = {
  toast: (text: string, tone?: ToastTone) => void;
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
};

const OverlaysCtx = createContext<Ctx | null>(null);

const TONE_ICON = {
  success: <CheckCircle2 size={18} className="text-[var(--positive)]" />,
  error: <AlertTriangle size={18} className="text-[var(--negative)]" />,
  info: <Info size={18} className="text-[var(--info)]" />,
};

export function OverlaysProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const seq = useRef(0);

  const toast = useCallback((text: string, tone: ToastTone = 'info') => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const confirm = useCallback((opts: ConfirmOpts) => {
    if (opts.danger) haptics.warning(); // alert the hand when a destructive dialog appears
    return new Promise<boolean>((resolve) => setConfirmState({ ...opts, resolve }));
  }, []);

  const closeConfirm = (v: boolean) => {
    confirmState?.resolve(v);
    setConfirmState(null);
  };

  return (
    <OverlaysCtx.Provider value={{ toast, confirm }}>
      {children}
      <Portal>
        <>
          {/* Toasts */}
          <div className="fixed top-[max(env(safe-area-inset-top),12px)] left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
            <AnimatePresence>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: -24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.96 }}
                  transition={spring.snappy}
                  className="flex items-center gap-2.5 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] pl-3 pr-4 py-2.5 shadow-[var(--shadow-md)]"
                >
                  {TONE_ICON[t.tone]}
                  <span className="text-[14px] font-medium text-[var(--text)]">{t.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Confirm dialog */}
          <AnimatePresence>
            {confirmState && (
              <div className="fixed inset-0 z-[65] grid place-items-center px-6">
                <motion.div
                  className="absolute inset-0 bg-black/55"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => closeConfirm(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={spring.snappy}
                  className="relative w-full max-w-[360px] rounded-[24px] bg-[var(--bg-elev)] border border-[var(--border)] p-5 shadow-[var(--shadow-lg)]"
                >
                  <h3 className="text-[18px] font-semibold tracking-tight">{confirmState.title}</h3>
                  {confirmState.message && (
                    <p className="mt-1.5 text-[14px] text-[var(--text-muted)] leading-relaxed">{confirmState.message}</p>
                  )}
                  <div className="mt-5 flex gap-2.5">
                    <Button variant="secondary" full onClick={() => closeConfirm(false)}>
                      {confirmState.cancelLabel ?? 'Отмена'}
                    </Button>
                    <Button
                      variant={confirmState.danger ? 'danger' : 'primary'}
                      full
                      onClick={() => closeConfirm(true)}
                    >
                      {confirmState.confirmLabel ?? 'Подтвердить'}
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      </Portal>
    </OverlaysCtx.Provider>
  );
}

export function useOverlays() {
  const ctx = useContext(OverlaysCtx);
  if (!ctx) throw new Error('useOverlays must be used inside OverlaysProvider');
  return ctx;
}
