'use client';

import { useState } from 'react';
import { APP_VERSION } from '@/lib/version';

// On-device layout diagnostics. Tap the build label to reveal exact viewport /
// safe-area / nav-position numbers — so a real-device screenshot pinpoints any
// bottom-bar gap instead of guessing. Temporary aid; remove once resolved.
type Metrics = Record<string, string | number | boolean | null>;

function measure(): Metrics {
  const probe = (css: string) => {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;width:0;visibility:hidden;pointer-events:none;${css}`;
    document.body.appendChild(el);
    const h = el.getBoundingClientRect().height;
    el.remove();
    return Math.round(h);
  };

  const safeBottom = probe('bottom:0;height:env(safe-area-inset-bottom)');
  const safeTop = probe('top:0;height:env(safe-area-inset-top)');
  const dvh = probe('top:0;height:100dvh');
  const svh = probe('top:0;height:100svh');
  const lvh = probe('top:0;height:100lvh');

  const navs = document.querySelectorAll('nav');
  const bar = navs[navs.length - 1] as HTMLElement | undefined;
  const barRect = bar?.getBoundingClientRect();
  const ih = window.innerHeight;

  return {
    standalone:
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS-only
      navigator.standalone === true,
    innerHeight: ih,
    visualVH: window.visualViewport ? Math.round(window.visualViewport.height) : null,
    'screen.height': window.screen?.height ?? null,
    '100dvh': dvh,
    '100svh': svh,
    '100lvh': lvh,
    'safe-bottom': safeBottom,
    'safe-top': safeTop,
    'bar.bottom': barRect ? Math.round(barRect.bottom) : null,
    'bar.height': barRect ? Math.round(barRect.height) : null,
    'GAP (ih - bar.bottom)': barRect ? Math.round(ih - barRect.bottom) : null,
    dpr: window.devicePixelRatio,
  };
}

export function Diagnostics() {
  const [m, setM] = useState<Metrics | null>(null);

  return (
    <div className="mt-5">
      <button
        onClick={() => setM((cur) => (cur ? null : measure()))}
        className="block w-full text-center text-[12px] text-[var(--text-subtle)]"
      >
        Трекер · сборка {APP_VERSION}
      </button>

      {m && (
        <div className="mt-3 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-3.5">
          <p className="text-[12px] font-semibold text-[var(--text-muted)] mb-2">Диагностика экрана</p>
          <div className="space-y-1">
            {Object.entries(m).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 text-[12px]">
                <span className="text-[var(--text-subtle)]">{k}</span>
                <span className="num text-[var(--text)] font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] text-[var(--text-subtle)] leading-snug">
            Пришли скрин этого блока — по «GAP» и «safe-bottom» точно определю причину зазора.
          </p>
        </div>
      )}
    </div>
  );
}
