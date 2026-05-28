'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PinPad } from './PinPad';
import { verifyPin, hasBiometric, biometricUnlock, PIN_LENGTH } from '@/lib/lock';
import { haptics } from '@/lib/haptics';

// Full-screen opaque overlay shown while the app is locked.
export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const bio = hasBiometric();

  const tryBio = useCallback(async () => {
    if (!bio) return;
    if (await biometricUnlock()) { haptics.success(); onUnlock(); }
  }, [bio, onUnlock]);

  // Auto-prompt Face ID on open, like a native app.
  useEffect(() => { tryBio(); }, [tryBio]);

  useEffect(() => {
    if (value.length !== PIN_LENGTH) return;
    verifyPin(value).then((ok) => {
      if (ok) { haptics.success(); onUnlock(); }
      else {
        haptics.error();
        setError(true);
        setTimeout(() => { setError(false); setValue(''); }, 450);
      }
    });
  }, [value, onUnlock]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[80] bg-[var(--bg)] flex flex-col items-center justify-center px-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-[360px] w-[360px] rounded-full blur-[120px] opacity-30"
        style={{ backgroundImage: 'var(--accent-grad)' }}
      />
      <div className="relative">
        <div className="flex justify-center mb-8">
          <span className="grid h-12 w-12 place-items-center rounded-[16px]" style={{ backgroundImage: 'var(--accent-grad)' }}>
            <span className="flex items-end gap-[3px] pb-1">
              <i className="block w-1 h-2.5 rounded-sm bg-[#07101F]" />
              <i className="block w-1 h-4 rounded-sm bg-[#07101F]" />
              <i className="block w-1 h-5 rounded-sm bg-[#07101F]" />
            </span>
          </span>
        </div>
        <PinPad
          title="Введите код"
          value={value}
          onChange={setValue}
          error={error}
          onBiometric={bio ? tryBio : undefined}
        />
      </div>
    </motion.div>
  );
}
