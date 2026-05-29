'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, LogOut, Scale, Trash2, X } from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import { Portal } from '@/components/ui/Portal';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { Sparkline } from '@/components/ui/Sparkline';
import { useOverlays } from '@/components/ui/Overlays';
import { useTheme } from '@/components/theme-provider';
import { useProfile, useProfileMutations } from '@/hooks/useProfile';
import { useBodyEntries, useBodyMutations } from '@/hooks/useBody';
import { BodyEntryForm } from '@/components/body/BodyEntryForm';
import { SecuritySection } from './SecuritySection';
import { createClient } from '@/lib/supabase/client';
import { fmtDateLabel } from '@/lib/utils';
import { APP_VERSION } from '@/lib/version';
import { Diagnostics } from '@/components/Diagnostics';
import type { ThemeMode, BodyEntry } from '@/lib/types';

const kgFormat = (n: number) => (Math.round(n * 10) / 10).toString();

export function ProfileScreen() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { update } = useProfileMutations();
  const { data: entries = [] } = useBodyEntries();
  const { remove } = useBodyMutations();
  const { mode, setMode } = useTheme();
  const { confirm } = useOverlays();

  const [editOpen, setEditOpen] = useState(false);
  const [bodyForm, setBodyForm] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const weights = entries.filter((e) => e.weight_kg != null);
  const latest = weights[0];
  const prev = weights[1];
  const delta = latest && prev ? latest.weight_kg! - prev.weight_kg! : null;
  const photos = entries.filter((e) => e.photo_url);

  const sparkPoints = useMemo(
    () => weights.slice(0, 14).map((e) => e.weight_kg!).reverse(),
    [weights],
  );

  const bmi = useMemo(() => {
    if (!latest?.weight_kg || !profile?.height_cm) return null;
    const m = profile.height_cm / 100;
    return latest.weight_kg / (m * m);
  }, [latest, profile]);

  const name = profile?.name || 'Профиль';

  function changeTheme(m: ThemeMode) {
    setMode(m);
    update.mutate({ theme: m });
  }

  async function signOut() {
    const ok = await confirm({ title: 'Выйти из аккаунта?', confirmLabel: 'Выйти' });
    if (!ok) return;
    await createClient().auth.signOut();
    router.replace('/sign-in');
    router.refresh();
  }

  async function deleteEntry(e: BodyEntry) {
    const ok = await confirm({ title: 'Удалить запись?', danger: true, confirmLabel: 'Удалить' });
    if (ok) remove.mutate(e.id);
  }

  return (
    <div>
      <AppHeader title="Профиль" />

      <Diagnostics />

      {/* Identity */}
      <div className="flex items-center gap-4 mb-5">
        <span className="grid h-16 w-16 place-items-center rounded-[22px] text-[24px] font-bold text-[var(--on-accent)]" style={{ backgroundImage: 'var(--accent-grad)' }}>
          {name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[20px] font-semibold truncate">{name}</p>
          <p className="text-[14px] text-[var(--text-muted)]">{profile?.height_cm ? `Рост ${profile.height_cm} см` : 'Рост не указан'}</p>
        </div>
        <button onClick={() => setEditOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface-alt)] text-[var(--text-muted)]" aria-label="Изменить">
          <Pencil size={17} />
        </button>
      </div>

      {/* Body stats */}
      <div className="rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] text-[var(--text-muted)] mb-1">Текущий вес</p>
            {latest?.weight_kg != null ? (
              <p className="num text-[34px] font-bold leading-none">
                <AnimatedNumber value={latest.weight_kg ?? 0} format={kgFormat} /><span className="text-[var(--text-muted)] text-[20px]"> кг</span>
              </p>
            ) : (
              <p className="text-[18px] text-[var(--text-subtle)]">—</p>
            )}
            {delta != null && (
              <p className={`text-[13px] mt-1 font-medium ${delta < 0 ? 'text-[var(--positive)]' : delta > 0 ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]'}`}>
                {delta > 0 ? '+' : ''}{delta.toFixed(1)} кг с прошлого раза
              </p>
            )}
          </div>
          {bmi && (
            <div className="text-right">
              <p className="text-[13px] text-[var(--text-muted)] mb-1">ИМТ</p>
              <p className="num text-[22px] font-semibold">{bmi.toFixed(1)}</p>
            </div>
          )}
        </div>
        {sparkPoints.length >= 2 && (
          <div className="mt-3"><Sparkline points={sparkPoints} width={300} height={50} /></div>
        )}
        <Button full variant="secondary" className="mt-4" onClick={() => setBodyForm(true)}>
          <Scale size={17} /> Записать вес / фото
        </Button>
      </div>

      {/* Progress photos */}
      {photos.length > 0 && (
        <div className="mb-4">
          <p className="text-[15px] font-semibold mb-2.5 px-1">Прогресс</p>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
            {photos.map((e) => (
              <button key={e.id} onClick={() => setLightbox(e.photo_url!)} className="shrink-0 relative">
                <Image src={e.photo_url!} alt={fmtDateLabel(e.recorded_on)} width={130} height={170} className="h-[170px] w-[130px] object-cover rounded-[16px] border border-[var(--border)]" unoptimized />
                <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[11px] font-medium text-white bg-black/45 rounded-md px-1.5 py-0.5 backdrop-blur-sm">
                  {fmtDateLabel(e.recorded_on)}{e.weight_kg ? ` · ${e.weight_kg} кг` : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History list */}
      {entries.length > 0 && (
        <div className="mb-4">
          <p className="text-[15px] font-semibold mb-2.5 px-1">Записи</p>
          <div className="space-y-2">
            {entries.slice(0, 20).map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--border)] p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium">{fmtDateLabel(e.recorded_on)}</p>
                  {e.note && <p className="text-[12px] text-[var(--text-subtle)] truncate">{e.note}</p>}
                </div>
                {e.weight_kg != null && <span className="num text-[15px] font-semibold">{e.weight_kg} кг</span>}
                <button onClick={() => deleteEntry(e)} className="text-[var(--text-subtle)] hover:text-[var(--negative)] p-1"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 mb-4">
        <p className="text-[14px] font-medium mb-2.5">Тема</p>
        <Segmented<ThemeMode>
          id="theme" value={mode} onChange={changeTheme}
          options={[{ value: 'dark', label: 'Тёмная' }, { value: 'light', label: 'Светлая' }, { value: 'auto', label: 'Авто' }]}
        />
      </div>

      <SecuritySection />

      <button onClick={signOut} className="flex items-center justify-center gap-2 w-full h-12 rounded-[16px] text-[15px] font-medium text-[var(--negative)] bg-[var(--negative-08)]">
        <LogOut size={18} /> Выйти
      </button>

      <p className="mt-6 text-center text-[12px] text-[var(--text-subtle)]">
        Трекер · сборка {APP_VERSION}
      </p>

      <ProfileEditForm open={editOpen} onClose={() => setEditOpen(false)} initialName={profile?.name ?? ''} initialHeight={profile?.height_cm ?? null} onSave={(p) => update.mutate(p)} />
      <BodyEntryForm open={bodyForm} onClose={() => setBodyForm(false)} />
      <Lightbox url={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

function ProfileEditForm({
  open, onClose, initialName, initialHeight, onSave,
}: {
  open: boolean; onClose: () => void; initialName: string; initialHeight: number | null;
  onSave: (patch: { name: string; height_cm: number | null }) => void;
}) {
  const [name, setName] = useState(initialName);
  const [height, setHeight] = useState(initialHeight ? String(initialHeight) : '');

  useEffect(() => { if (open) { setName(initialName); setHeight(initialHeight ? String(initialHeight) : ''); } }, [open, initialName, initialHeight]);

  return (
    <Sheet
      open={open} onClose={onClose} title="Профиль"
      footer={<Button full size="lg" onClick={() => { onSave({ name: name.trim(), height_cm: height ? parseFloat(height.replace(',', '.')) : null }); onClose(); }}>Сохранить</Button>}
    >
      <Field label="Имя"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" /></Field>
      <Field label="Рост, см"><Input inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="например, 178" /></Field>
    </Sheet>
  );
}

function Lightbox({ url, onClose }: { url: string | null; onClose: () => void }) {
  return (
    <Portal>
    <AnimatePresence>
      {url && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button className="absolute top-5 right-5 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white" aria-label="Закрыть"><X size={20} /></button>
          <motion.img
            src={url} alt="Фото прогресса"
            initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
            className="max-h-[85dvh] max-w-full rounded-[20px] object-contain"
          />
        </motion.div>
      )}
    </AnimatePresence>
    </Portal>
  );
}
