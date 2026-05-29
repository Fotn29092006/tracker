'use client';

import { useCallback, useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────
//  /shelltest — standalone PWA layout harness (NO auth, NO data).
//
//  Why it exists: the bottom-gap bug only manifests in an INSTALLED iOS PWA,
//  not in a normal browser tab — so a plain "open in browser, looks fine"
//  proves nothing. This page replicates the app-shell structure (fixed inset-0
//  frame + scrolling main + in-flow bottom nav with var(--sab) padding) and
//  prints the exact viewport / safe-area numbers, with a PASS/FAIL verdict on
//  the one thing that matters: does the web view fill the WHOLE screen (so the
//  nav reaches the physical bottom), or is it short (→ the gap).
//
//  Verdict logic: in standalone, a correct full-bleed web view has
//  innerHeight == 100lvh. If 100lvh − innerHeight > 1px, the web view is
//  shorter than the screen → that delta IS the bottom gap.
//
//  ?sat= / ?sab= override the safe-area vars so the layout can be exercised
//  with simulated insets off-device (Playwright / preview).
// ─────────────────────────────────────────────────────────────────────────

type Metrics = Record<string, string | number | boolean | null>;

const NAV = ['Главная', 'Задачи', 'Финансы', 'Тренировки', 'Заметки'];

export default function ShellTest() {
  const [m, setM] = useState<Metrics | null>(null);

  const measure = useCallback(() => {
    const probe = (css: string) => {
      const el = document.createElement('div');
      el.style.cssText = `position:fixed;left:0;width:0;visibility:hidden;pointer-events:none;${css}`;
      document.body.appendChild(el);
      const h = el.getBoundingClientRect().height;
      el.remove();
      return Math.round(h);
    };

    const ih = window.innerHeight;
    const lvh = probe('top:0;height:100lvh');
    const dvh = probe('top:0;height:100dvh');
    const svh = probe('top:0;height:100svh');
    const sat = probe('top:0;height:var(--sat)');
    const sab = probe('bottom:0;height:var(--sab)');

    const nav = document.getElementById('st-nav')?.getBoundingClientRect();
    const row = document.getElementById('st-row')?.getBoundingClientRect();

    setM({
      standalone:
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-expect-error iOS-only
        navigator.standalone === true,
      innerHeight: ih,
      visualVH: window.visualViewport ? Math.round(window.visualViewport.height) : null,
      'screen.height': window.screen?.height ?? null,
      '100lvh': lvh,
      '100dvh': dvh,
      '100svh': svh,
      'lvh − inner': lvh - ih,
      'screen − inner': (window.screen?.height ?? ih) - ih,
      '--sat': sat,
      '--sab': sab,
      'nav.bottom': nav ? Math.round(nav.bottom) : null,
      'nav.height': nav ? Math.round(nav.height) : null,
      'row.bottom': row ? Math.round(row.bottom) : null,
      dpr: window.devicePixelRatio,
    });
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const set = (name: '--sat' | '--sab', raw: string | null) => {
      if (!raw) return;
      const v = /[a-z%]/i.test(raw) ? raw : `${raw}px`;
      document.documentElement.style.setProperty(name, v);
    };
    set('--sat', p.get('sat'));
    set('--sab', p.get('sab'));

    measure();
    const on = () => measure();
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    window.visualViewport?.addEventListener('resize', on);
    const t = setTimeout(measure, 350); // settle after iOS chrome animates
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
      window.visualViewport?.removeEventListener('resize', on);
      clearTimeout(t);
    };
  }, [measure]);

  const standalone = !!m?.standalone;
  const lvhMinusInner = m ? Number(m['lvh − inner']) : null;
  const verdict =
    !m ? 'loading'
    : !standalone ? 'browser'
    : lvhMinusInner !== null && lvhMinusInner <= 1 ? 'pass'
    : 'fail';

  const banner = {
    loading: { txt: '…', bg: 'var(--surface)', fg: 'var(--text-muted)' },
    browser: {
      txt: 'Это браузер, не PWA. Добавь на экран «Домой» и открой оттуда — иначе цифры браузерные.',
      bg: 'var(--warning-12)', fg: 'var(--warning)',
    },
    pass: {
      txt: `✓ OK — вебвью на весь экран. Зазора снизу нет.`,
      bg: 'var(--positive-16)', fg: 'var(--positive)',
    },
    fail: {
      txt: `✗ ЗАЗОР: вебвью короче экрана на ${lvhMinusInner}px. Это и есть полоса снизу.`,
      bg: 'var(--negative-16)', fg: 'var(--negative)',
    },
  }[verdict];

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div
          className="mx-auto w-full max-w-[640px] px-4"
          style={{ paddingTop: 'max(var(--sat), 16px)', paddingBottom: '24px' }}
        >
          <h1 className="text-[24px] font-bold leading-tight">Shell-тест</h1>
          <p className="text-[13px] mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
            Меню снизу должно стоять вплотную к нижнему краю экрана.
          </p>

          <div
            className="rounded-[16px] p-4 mb-4 text-center font-semibold text-[15px] leading-snug"
            style={{ background: banner.bg, color: banner.fg }}
          >
            {banner.txt}
          </div>

          {m && (
            <div
              className="rounded-[14px] p-3.5"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
            >
              {Object.entries(m).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 text-[12.5px] py-[3px]">
                  <span style={{ color: 'var(--text-subtle)' }}>{k}</span>
                  <span className="num font-medium" style={{ color: 'var(--text)' }}>{String(v)}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={measure}
            className="mt-4 w-full h-11 rounded-[12px] font-medium"
            style={{ background: 'var(--surface-alt)', color: 'var(--text)' }}
          >
            Перемерить
          </button>

          {/* filler so the page actually scrolls */}
          <div aria-hidden style={{ height: '45vh' }} />
        </div>
      </main>

      {/* Bottom nav clone — same structure/padding as the real TabBar. */}
      <nav
        id="st-nav"
        className="shrink-0"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elev)', paddingBottom: 'var(--sab)' }}
      >
        <ul
          id="st-row"
          className="flex items-stretch"
          style={{ height: '58px', maxWidth: '560px', margin: '0 auto' }}
        >
          {NAV.map((t, i) => (
            <li key={t} className="flex-1">
              <div className="h-full flex flex-col items-center justify-center gap-1">
                <span
                  style={{
                    width: 23, height: 23, borderRadius: 7,
                    background: i === 0 ? 'var(--accent)' : 'var(--text-subtle)',
                    opacity: i === 0 ? 1 : 0.45,
                  }}
                />
                <span
                  className="text-[10.5px] font-medium"
                  style={{ color: i === 0 ? 'var(--accent)' : 'var(--text-subtle)' }}
                >
                  {t}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
