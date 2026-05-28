'use client';

import { useEffect, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { PinPad } from './PinPad';
import { setPin, PIN_LENGTH } from '@/lib/lock';
import { haptics } from '@/lib/haptics';

// Two-step PIN creation. Calls onDone() once the code is set.
export function PinSetupSheet({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [first, setFirst] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) { setStep('enter'); setFirst(''); setValue(''); setError(false); }
  }, [open]);

  useEffect(() => {
    if (value.length !== PIN_LENGTH) return;
    if (step === 'enter') {
      setFirst(value);
      setStep('confirm');
      setValue('');
    } else {
      if (value === first) {
        setPin(value).then(() => { haptics.success(); onDone(); onClose(); });
      } else {
        haptics.error();
        setError(true);
        setTimeout(() => { setError(false); setStep('enter'); setFirst(''); setValue(''); }, 450);
      }
    }
  }, [value, step, first, onClose, onDone]);

  return (
    <Sheet open={open} onClose={onClose} title="Код-пароль">
      <div className="py-3">
        <PinPad
          title={step === 'enter' ? 'Придумайте код' : 'Повторите код'}
          subtitle={step === 'confirm' && error ? 'Коды не совпали — ещё раз' : '4 цифры'}
          value={value}
          onChange={setValue}
          error={error}
        />
      </div>
    </Sheet>
  );
}
