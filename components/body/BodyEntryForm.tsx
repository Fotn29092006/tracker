'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, X } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Label } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { useOverlays } from '@/components/ui/Overlays';
import { useBodyMutations } from '@/hooks/useBody';
import { todayISO } from '@/lib/utils';

export function BodyEntryForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { add, uploadPhoto } = useBodyMutations();
  const { toast } = useOverlays();
  const fileRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(todayISO()); setWeight(''); setNote(''); setFile(null); setPreview(null);
  }, [open]);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const weightNum = parseFloat(weight.replace(',', '.'));
  const canSubmit = (!!weight && weightNum > 0) || !!file || !!note.trim();

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    try {
      let photo_url: string | null = null;
      if (file) photo_url = await uploadPhoto(file);
      await add.mutateAsync({
        recorded_on: date,
        weight_kg: weight ? weightNum : null,
        photo_url,
        note: note.trim() || null,
      });
      onClose();
    } catch {
      toast('Не удалось сохранить', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      open={open} onClose={onClose} title="Вес и фото"
      footer={<Button full size="lg" disabled={busy || !canSubmit} onClick={submit}>{busy ? <Loader2 size={18} className="animate-spin" /> : 'Сохранить'}</Button>}
    >
      <Field label="Вес, кг">
        <Input inputMode="decimal" placeholder="например, 75.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
      </Field>

      <div className="mb-3.5">
        <Label>Фото прогресса</Label>
        {preview ? (
          <div className="relative w-full overflow-hidden rounded-[16px] border border-[var(--border)]">
            <Image src={preview} alt="Предпросмотр" width={600} height={400} className="w-full h-auto max-h-[300px] object-cover" unoptimized />
            <button onClick={() => setFile(null)} className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white">
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-[16px] border border-dashed border-[var(--border-strong)] py-8 text-[var(--text-muted)]"
          >
            <Camera size={20} /> Добавить фото
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>

      <div className="mb-3.5">
        <Label>Дата</Label>
        <DateField value={date} onChange={(v) => setDate(v ?? todayISO())} clearable={false} />
      </div>

      <Field label="Заметка">
        <Input placeholder="Самочувствие, замеры… (необязательно)" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </Sheet>
  );
}
