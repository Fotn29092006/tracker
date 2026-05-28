'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import type { Theme, ThemeMode } from '@/lib/types';

// The only job here: keep <html data-theme> in sync with the user's mode.
// All colour lives in CSS variables (globals.css) — so there's no JS palette
// that can drift from CSS during hydration. `auto` follows the clock.

const STORAGE_KEY = 'tracker-theme';

type Ctx = {
  theme: Theme;        // resolved (what's showing)
  mode: ThemeMode;     // preference (dark|light|auto)
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

function autoTheme(): Theme {
  const h = new Date().getHours();
  return h >= 7 && h < 19 ? 'light' : 'dark';
}

function readMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === 'auto' || s === 'dark' || s === 'light') return s;
  } catch { /* private mode */ }
  return 'dark';
}

const resolve = (m: ThemeMode): Theme => (m === 'auto' ? autoTheme() : m);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readMode);
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document !== 'undefined') {
      const dt = document.documentElement.dataset.theme;
      if (dt === 'dark' || dt === 'light') return dt;
    }
    return resolve(readMode());
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    // keep the iOS status-bar / address-bar tint in step
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim());
  }, [theme]);

  // re-resolve `auto` at the next 07:00 / 19:00 boundary
  useEffect(() => {
    if (mode !== 'auto') return;
    let cancelled = false;
    const schedule = (): number => {
      const now = new Date();
      const next = new Date(now);
      const h = now.getHours();
      if (h < 7) next.setHours(7, 0, 0, 0);
      else if (h < 19) next.setHours(19, 0, 0, 0);
      else { next.setDate(next.getDate() + 1); next.setHours(7, 0, 0, 0); }
      return window.setTimeout(() => {
        if (cancelled) return;
        setThemeState(autoTheme());
        schedule();
      }, Math.max(1000, next.getTime() - now.getTime()));
    };
    const id = schedule();
    return () => { cancelled = true; clearTimeout(id); };
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    try { localStorage.setItem(STORAGE_KEY, m); } catch { /* ignore */ }
    setThemeState(resolve(m));
  }, []);

  const toggle = useCallback(() => setMode(theme === 'dark' ? 'light' : 'dark'), [setMode, theme]);

  const value = useMemo<Ctx>(() => ({ theme, mode, setMode, toggle }), [theme, mode, setMode, toggle]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
