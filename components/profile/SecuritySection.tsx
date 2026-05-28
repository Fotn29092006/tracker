'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, ScanFace, KeyRound } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { useOverlays } from '@/components/ui/Overlays';
import { PinSetupSheet } from '@/components/lock/PinSetupSheet';
import {
  hasPin, clearPin, hasBiometric, registerBiometric, clearBiometric, isBiometricSupported,
} from '@/lib/lock';

export function SecuritySection() {
  const { toast, confirm } = useOverlays();
  const [pinOn, setPinOn] = useState(false);
  const [bioOn, setBioOn] = useState(false);
  const [bioSupported, setBioSupported] = useState(false);
  const [setup, setSetup] = useState(false);

  useEffect(() => {
    setPinOn(hasPin());
    setBioOn(hasBiometric());
    isBiometricSupported().then(setBioSupported);
  }, []);

  async function togglePin(on: boolean) {
    if (on) {
      setSetup(true);
    } else {
      const ok = await confirm({ title: 'Убрать код-пароль?', message: 'Вход в приложение без кода и Face ID.', danger: true, confirmLabel: 'Убрать' });
      if (ok) { clearPin(); setPinOn(false); setBioOn(false); }
    }
  }

  async function toggleBio(on: boolean) {
    if (on) {
      const ok = await registerBiometric();
      if (ok) { setBioOn(true); toast('Face ID подключён', 'success'); }
      else toast('Не удалось подключить Face ID', 'error');
    } else {
      clearBiometric();
      setBioOn(false);
    }
  }

  return (
    <div className="rounded-[var(--r-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={18} className="text-[var(--accent)]" />
        <p className="text-[15px] font-semibold">Защита</p>
      </div>

      <Row icon={<KeyRound size={18} />} label="Код-пароль" hint="Запрашивать при открытии">
        <Switch checked={pinOn} onChange={togglePin} label="Код-пароль" />
      </Row>

      {pinOn && bioSupported && (
        <Row icon={<ScanFace size={18} />} label="Face ID / Touch ID" hint="Быстрый вход по биометрии">
          <Switch checked={bioOn} onChange={toggleBio} label="Face ID" />
        </Row>
      )}

      {pinOn && (
        <button onClick={() => setSetup(true)} className="mt-1 text-[14px] font-medium text-[var(--accent)]">
          Изменить код
        </button>
      )}

      <PinSetupSheet open={setup} onClose={() => setSetup(false)} onDone={() => setPinOn(true)} />
    </div>
  );
}

function Row({ icon, label, hint, children }: { icon: React.ReactNode; label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface-alt)] text-[var(--text-muted)]">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium">{label}</p>
        <p className="text-[12px] text-[var(--text-subtle)]">{hint}</p>
      </div>
      {children}
    </div>
  );
}
