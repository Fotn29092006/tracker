'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PinPad } from './PinPad';
import { useProfile } from '@/hooks/useProfile';
import { verifyPin, hasBiometric, biometricUnlock, PIN_LENGTH } from '@/lib/lock';
import { haptics } from '@/lib/haptics';

// Full-screen opaque overlay shown while the app is locked.
export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { data: profile } = useProfile();
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const bio = hasBiometric();
  const name = profile?.name?.split(' ')[0] || '';

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
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-[var(--bg)] px-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
        style={{ backgroundImage: 'var(--accent-grad)' }}
      />

      <div className="relative flex flex-col items-center">
        {profile?.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt=""
            width={88}
            height={88}
            sizes="88px"
            className="h-[88px] w-[88px] rounded-full object-cover shadow-[0_10px_30px_var(--accent-glow)]"
          />
        ) : (
          <span
            className="grid h-[88px] w-[88px] place-items-center rounded-full text-[32px] font-bold text-[var(--on-accent)] shadow-[0_10px_30px_var(--accent-glow)]"
            style={{ backgroundImage: 'var(--accent-grad)' }}
          >
            {(name || '?').slice(0, 1).toUpperCase()}
          </span>
        )}

        <h1 className="mt-5 mb-1 text-[24px] font-bold tracking-tight">
          {name ? `С возвращением, ${name}` : 'С возвращением'}
        </h1>

        <PinPad
          subtitle="Введите код-пароль"
          value={value}
          onChange={setValue}
          error={error}
          onBiometric={bio ? tryBio : undefined}
        />
      </div>
    </motion.div>
  );
}
