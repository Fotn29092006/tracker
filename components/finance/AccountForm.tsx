'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Label, AmountInput } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { useOverlays } from '@/components/ui/Overlays';
import { useFinanceMutations } from '@/hooks/useFinance';
import { ACCOUNT_COLORS } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { Account } from '@/lib/types';

const CURRENCIES = ['KZT', 'USD', 'EUR', 'RUB'];

export function AccountForm({ open, onClose, account }: { open: boolean; onClose: () => void; account?: Account | null }) {
  const { addAccount, updateAccount, removeAccount } = useFinanceMutations();
  const { toast, confirm } = useOverlays();
  const editing = !!account;

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('KZT');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);

  useEffect(() => {
    if (!open) return;
    setName(account?.name ?? '');
    setCurrency(account?.currency ?? 'KZT');
    setBalance(account ? String(account.initial_balance) : '');
    setColor(account?.color ?? ACCOUNT_COLORS[0]);
  }, [open, account]);

  const busy = addAccount.isPending || updateAccount.isPending;

  async function submit() {
    if (!name.trim()) return;
    const initial_balance = parseFloat(balance.replace(',', '.')) || 0;
    try {
      if (editing && account) {
        await updateAccount.mutateAsync({ id: account.id, patch: { name: name.trim(), currency, initial_balance, color } });
      } else {
        await addAccount.mutateAsync({ name, currency, initial_balance, color });
      }
      onClose();
    } catch { toast('Не удалось сохранить', 'error'); }
  }

  async function del() {
    if (!account) return;
    const ok = await confirm({
      title: 'Удалить счёт?',
      message: 'Все операции по этому счёту тоже удалятся.',
      danger: true, confirmLabel: 'Удалить',
    });
    if (!ok) return;
    try { await removeAccount.mutateAsync(account.id); onClose(); }
    catch { toast('Не удалось удалить', 'error'); }
  }

  return (
    <Sheet
      open={open} onClose={onClose}
      title={editing ? 'Счёт' : 'Новый счёт'}
      footer={<Button full size="lg" disabled={busy || !name.trim()} onClick={submit}>{editing ? 'Сохранить' : 'Добавить'}</Button>}
    >
      <Field label="Название">
        <Input autoFocus placeholder="Kaspi, Halyk, Наличные…" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <div className="mb-3.5">
        <Label>{editing ? 'Текущий баланс' : 'Начальный баланс'}</Label>
        <AmountInput placeholder="0" value={balance} onChange={(e) => setBalance(e.target.value)} />
      </div>

      <div className="mb-3.5">
        <Label>Валюта</Label>
        <Segmented id="acc-cur" value={currency} onChange={setCurrency} options={CURRENCIES.map((c) => ({ value: c, label: c }))} />
      </div>

      <div className="mb-2">
        <Label>Цвет</Label>
        <div className="flex flex-wrap gap-2.5">
          {ACCOUNT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn('h-9 w-9 rounded-full transition-transform', color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-elev)] scale-110' : '')}
              style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      {editing && (
        <button onClick={del} className="mt-3 flex items-center gap-2 text-[14px] text-[var(--negative)] font-medium">
          <Trash2 size={16} /> Удалить счёт
        </button>
      )}
    </Sheet>
  );
}
