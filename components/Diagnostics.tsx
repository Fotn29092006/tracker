'use client';

import { useCallback, useEffect, useState } from 'react';
import { APP_VERSION } from '@/lib/version';

// TEMPORARY on-device probe. The bottom-gap bug only exists in the installed
// iOS PWA, which we can't measure off-device — so this prints the real
// standalone viewport numbers right inside the app (Profile), auto-expanded.
// The verdict keys on the ONE thing that matters: is the web view as tall as
// the physical screen (innerHeight == 100lvh == screen.height)? If not, that
// deficit IS the gap. Remove once resolved.

type Metrics = Record<string, string | number | boolean | null>;

function probe(css: string) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;left:0;width:0;visibility:hidden;pointer-events:none;${css}`;
  document.body.appendChild(el);
  const h = el.getBoundingClientRect().height;
  el.remove();
  return Math.round(h);
}

export function Diagnostics() {
  const [m, setM] = useState<Metrics | null>(null);

  const measure = useCallback(() => {
    const ih = window.innerHeight;
    const lvh = probe('top:0;height:100lvh');
    const dvh = probe('top:0;height:100dvh');
    const svh = probe('top:0;height:100svh');
    const sat = probe('top:0;height:var(--sat)');
    const sab = probe('bottom:0;height:var(--sab)');
    const navs = document.querySelectorAll('nav');
    const bar = navs[navs.length - 1] as HTMLElement | undefined;
    const r = bar?.getBoundingClientRect();
    const screenH = window.screen?.height ?? ih;

    setM({
      standalone:
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-expect-error iOS-only
        navigator.standalone === true,
      innerHeight: ih,
      visualVH: window.visualViewport ? Math.round(window.visualViewport.height) : null,
      'screen.height': screenH,
      '100lvh': lvh,
      '100dvh': dvh,
      '100svh': svh,
      'lvh − inner': lvh - ih,
      'screen − inner': screenH - ih,
      'safe-top': sat,
      'safe-bottom': sab,
      'bar.bottom': r ? Math.round(r.bottom) : null,
      'bar.height': r ? Math.round(r.height) : null,
      'GAP (ih − bar)': r ? Math.round(ih - r.bottom) : null,
      dpr: window.devicePixelRatio,
    });
  }, []);

  useEffect(() => {
    measure();
    const on = () => measure();
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    window.visualViewport?.addEventListener('resize', on);
    const t = setTimeout(measure, 400);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
      window.visualViewport?.removeEventListener('resize', on);
      clearTimeout(t);
    };
  }, [measure]);

  const standalone = !!m?.standalone;
  const deficit = m ? Number(m['lvh − inner']) : null;

  let bg = 'var(--surface)';
  let fg = 'var(--text-muted)';
  let verdict = '…';
  if (m) {
    if (!standalone) {
      bg = 'var(--warning-12)'; fg = 'var(--warning)';
      verdict = 'Это не standalone. Открой как PWA с экрана «Домой».';
    } else if (deficit !== null && deficit <= 1) {
      bg = 'var(--positive-16)'; fg = 'var(--positive)';
      verdict = '✓ Вебвью на весь экран. Полосы снизу нет.';
    } else {
      bg = 'var(--accent-12)'; fg = 'var(--accent)';
      verdict = `iOS даёт вебвью на ${deficit}px короче экрана — высоту тут не исправить (особенность устройства). Поэтому меню и полоса под ним закрашены в цвет фона: шва быть не должно. Проверь низ глазами.`;
    }
  }

  return (
    <div className="mt-6 mb-2">
      <div
        className="rounded-[14px] p-3.5"
        style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] font-semibold text-[var(--text-muted)]">
            Диагностика · сборка {APP_VERSION}
          </p>
          <button
            onClick={measure}
            className="text-[11px] px-2 py-1 rounded-md"
            style={{ background: 'var(--surface-alt)', color: 'var(--text-muted)' }}
          >
            Обновить
          </button>
        </div>

        <div
          className="rounded-[10px] p-2.5 mb-2.5 text-[12px] font-medium leading-snug"
          style={{ background: bg, color: fg }}
        >
          {verdict}
        </div>

        {m && (
          <div className="space-y-1">
            {Object.entries(m).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 text-[12px]">
                <span className="text-[var(--text-subtle)]">{k}</span>
                <span className="num text-[var(--text)] font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2.5 text-[11px] text-[var(--text-subtle)] leading-snug">
          Скинь скрин этого блока — по числам добью точно.
        </p>
      </div>
    </div>
  );
}
