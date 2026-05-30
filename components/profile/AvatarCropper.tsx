'use client';

import { useEffect, useRef, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';

const VIEW = 280; // on-screen crop circle (px)
const OUT = 320; // exported avatar size (px)

// Pan + zoom avatar cropper: drag the photo to position it, slider to zoom,
// then export the framed region to a square JPEG (displayed circle-cropped).
export function AvatarCropper({
  file,
  onCancel,
  onConfirm,
}: {
  file: File | null;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    if (!file) { setSrc(null); setNat(null); return; }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setBusy(false);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // "cover" base scale so the shorter side fills the circle, then user zoom.
  const base = nat ? VIEW / Math.min(nat.w, nat.h) : 1;
  const bw = nat ? nat.w * base : 0;
  const bh = nat ? nat.h * base : 0;
  const dw = bw * scale;
  const dh = bh * scale;
  const maxX = Math.max(0, (dw - VIEW) / 2);
  const maxY = Math.max(0, (dh - VIEW) / 2);
  const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

  // Keep the photo covering the circle when zoom changes.
  useEffect(() => {
    setOffset((o) => ({ x: clamp(o.x, maxX), y: clamp(o.y, maxY) }));
  }, [maxX, maxY]);

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    setOffset({
      x: clamp(drag.current.ox + (e.clientX - drag.current.x), maxX),
      y: clamp(drag.current.oy + (e.clientY - drag.current.y), maxY),
    });
  }
  function onPointerUp() { drag.current = null; }

  function save() {
    const img = imgRef.current;
    if (!img || !nat) return;
    setBusy(true);
    const canvas = document.createElement('canvas');
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext('2d');
    if (!ctx) { setBusy(false); return; }
    const f = OUT / VIEW;
    ctx.drawImage(
      img,
      (VIEW / 2 - dw / 2 + offset.x) * f,
      (VIEW / 2 - dh / 2 + offset.y) * f,
      dw * f,
      dh * f,
    );
    canvas.toBlob(
      (blob) => { if (blob) onConfirm(blob); else setBusy(false); },
      'image/jpeg',
      0.9,
    );
  }

  return (
    <Sheet
      open={!!file}
      onClose={onCancel}
      title="Фото профиля"
      footer={<Button full size="lg" disabled={busy || !nat} onClick={save}>Сохранить</Button>}
    >
      <div className="flex flex-col items-center">
        <div
          className="relative touch-none overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-alt)]"
          style={{ width: VIEW, height: VIEW }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
              style={{
                width: bw || 1,
                height: bh || 1,
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              }}
            />
          )}
        </div>

        <div className="mt-4 flex w-full items-center gap-3">
          <span className="text-[12px] text-[var(--text-subtle)]">Зум</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            aria-label="Масштаб"
            className="flex-1 accent-[var(--accent)]"
          />
        </div>
        <p className="mt-2 text-[12px] text-[var(--text-subtle)]">Двигай фото пальцем · ползунком приближай</p>
      </div>
    </Sheet>
  );
}
