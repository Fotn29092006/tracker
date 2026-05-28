'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Label, AmountInput } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { Chip } from '@/components/ui/Pill';
import { DateField } from '@/components/ui/DateField';
import { useOverlays } from '@/components/ui/Overlays';
import { useFinanceMutations } from '@/hooks/useFinance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';
import { todayISO } from '@/lib/utils';
import type { AccountWithBalance, Transaction, TxKind } from '@/lib/types';

export function TransactionForm({
  open, onClose, accounts, tx, onNeedAccount,
}: {
  open: boolean;
  onClose: () => void;
  accounts: AccountWithBalance[];
  tx?: Transaction | null;
  onNeedAccount?: () => void;
}) {
  const { addTransaction, updateTransaction, removeTransaction } = useFinanceMutations();
  const { toast, confirm } = useOverlays();
  const editing = !!tx;

  const [kind, setKind] = useState<TxKind>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState<string>('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState<string>(todayISO());

  useEffect(() => {
    if (!open) return;
    setKind(tx?.kind ?? 'expense');
    setAmount(tx ? String(tx.amount) : '');
    setAccountId(tx?.account_id ?? accounts[0]?.id ?? '');
    setCategory(tx?.category ?? '');
    setNote(tx?.note ?? '');
    setDate(tx?.occurred_on ?? todayISO());
  }, [open, tx, accounts]);

  const presets = kind === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const busy = addTransaction.isPending || updateTransaction.isPending;
  const amountNum = parseFloat(amount.replace(',', '.')) || 0;

  async function submit() {
    if (amountNum <= 0 || !accountId) return;
    const payload = {
      account_id: accountId, kind, amount: amountNum,
      category: category.trim() || null, note: note.trim() || null, occurred_on: date,
    };
    try {
      if (editing && tx) await updateTransaction.mutateAsync({ id: tx.id, patch: payload });
      else await addTransaction.mutateAsync(payload);
      onClose();
    } catch { toast('Не удалось сохранить', 'error'); }
  }

  async function del() {
    if (!tx) return;
    const ok = await confirm({ title: 'Удалить операцию?', danger: true, confirmLabel: 'Удалить' });
    if (ok) { await removeTransaction.mutateAsync(tx.id); onClose(); }
  }

  if (accounts.length === 0) {
    return (
      <Sheet open={open} onClose={onClose} title="Новая операция">
        <p className="text-[15px] text-[var(--text-muted)] py-2">Сначала добавь счёт — куда записывать деньги.</p>
        <Button full size="lg" className="mt-3" onClick={() => { onClose(); onNeedAccount?.(); }}>Добавить счёт</Button>
      </Sheet>
    );
  }

  return (
    <Sheet
      open={open} onClose={onClose}
      title={editing ? 'Операция' : 'Новая операция'}
      footer={<Button full size="lg" disabled={busy || amountNum <= 0} onClick={submit}>{editing ? 'Сохранить' : 'Добавить'}</Button>}
    >
      <Segmented<TxKind>
        id="tx-kind" className="mb-4"
        value={kind} onChange={(k) => { setKind(k); setCategory(''); }}
        options={[{ value: 'expense', label: 'Расход' }, { value: 'income', label: 'Доход' }]}
      />

      <div className="mb-4">
        <AmountInput
          autoFocus placeholder="0" value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ color: kind === 'income' ? 'var(--positive)' : 'var(--text)' }}
        />
      </div>

      <div className="mb-4">
        <Label>Счёт</Label>
        <div className="flex flex-wrap gap-2">
          {accounts.map((a) => (
            <Chip key={a.id} active={accountId === a.id} onClick={() => setAccountId(a.id)}>
              <span className="h-2 w-2 rounded-full" style={{ background: a.color }} />
              {a.name}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mb-3.5">
        <Label>Категория</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {presets.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? '' : c)}>{c}</Chip>
          ))}
        </div>
        <Input placeholder="Или своя категория" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>

      <Field label="Заметка">
        <Input placeholder="Необязательно" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      <div className="mb-2">
        <Label>Дата</Label>
        <DateField value={date} onChange={(v) => setDate(v ?? todayISO())} clearable={false} />
      </div>

      {editing && (
        <button onClick={del} className="mt-3 flex items-center gap-2 text-[14px] text-[var(--negative)] font-medium">
          <Trash2 size={16} /> Удалить операцию
        </button>
      )}
    </Sheet>
  );
}
