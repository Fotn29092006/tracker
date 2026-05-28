'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Label, AmountInput } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { DateField } from '@/components/ui/DateField';
import { useOverlays } from '@/components/ui/Overlays';
import { useFinanceMutations } from '@/hooks/useFinance';
import type { Debt, DebtDirection } from '@/lib/types';

export function DebtForm({ open, onClose, debt }: { open: boolean; onClose: () => void; debt?: Debt | null }) {
  const { addDebt, updateDebt, removeDebt } = useFinanceMutations();
  const { toast, confirm } = useOverlays();
  const editing = !!debt;

  const [direction, setDirection] = useState<DebtDirection>('owed_to_me');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [due, setDue] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDirection(debt?.direction ?? 'owed_to_me');
    setCounterparty(debt?.counterparty ?? '');
    setAmount(debt ? String(debt.amount) : '');
    setNote(debt?.note ?? '');
    setDue(debt?.due_date ?? null);
  }, [open, debt]);

  const busy = addDebt.isPending || updateDebt.isPending;
  const amountNum = parseFloat(amount.replace(',', '.')) || 0;

  async function submit() {
    if (!counterparty.trim() || amountNum <= 0) return;
    const payload = { direction, counterparty: counterparty.trim(), amount: amountNum, note: note.trim() || null, due_date: due };
    try {
      if (editing && debt) await updateDebt.mutateAsync({ id: debt.id, patch: payload });
      else await addDebt.mutateAsync(payload);
      onClose();
    } catch { toast('Не удалось сохранить', 'error'); }
  }

  async function del() {
    if (!debt) return;
    const ok = await confirm({ title: 'Удалить долг?', danger: true, confirmLabel: 'Удалить' });
    if (ok) { await removeDebt.mutateAsync(debt.id); onClose(); }
  }

  return (
    <Sheet
      open={open} onClose={onClose}
      title={editing ? 'Долг' : 'Новый долг'}
      footer={<Button full size="lg" disabled={busy || !counterparty.trim() || amountNum <= 0} onClick={submit}>{editing ? 'Сохранить' : 'Добавить'}</Button>}
    >
      <Segmented<DebtDirection>
        id="debt-dir" className="mb-4"
        value={direction} onChange={setDirection}
        options={[{ value: 'owed_to_me', label: 'Мне должны' }, { value: 'i_owe', label: 'Я должен' }]}
      />
      <div className="mb-4">
        <AmountInput autoFocus placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <Field label="Кто / кому">
        <Input placeholder="Имя" value={counterparty} onChange={(e) => setCounterparty(e.target.value)} />
      </Field>
      <Field label="Заметка">
        <Input placeholder="За что (необязательно)" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div className="mb-2">
        <Label>Вернуть до</Label>
        <DateField value={due} onChange={setDue} />
      </div>
      {editing && (
        <button onClick={del} className="mt-3 flex items-center gap-2 text-[14px] text-[var(--negative)] font-medium">
          <Trash2 size={16} /> Удалить долг
        </button>
      )}
    </Sheet>
  );
}
