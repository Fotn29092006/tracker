'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Field, Input, Label, AmountInput } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Pill';
import { DateField } from '@/components/ui/DateField';
import { useOverlays } from '@/components/ui/Overlays';
import { useFinanceMutations } from '@/hooks/useFinance';
import type { AccountWithBalance, SavingsGoal } from '@/lib/types';

export function SavingsGoalForm({
  open, onClose, goal, accounts,
}: {
  open: boolean;
  onClose: () => void;
  goal?: SavingsGoal | null;
  accounts: AccountWithBalance[];
}) {
  const { addSaving, updateSaving, removeSaving } = useFinanceMutations();
  const { toast, confirm } = useOverlays();
  const editing = !!goal;

  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [deadline, setDeadline] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(goal?.title ?? '');
    setTarget(goal ? String(goal.target_amount) : '');
    setSaved(goal ? String(goal.saved_amount) : '');
    setDeadline(goal?.deadline ?? null);
    setAccountId(goal?.account_id ?? null);
  }, [open, goal]);

  const busy = addSaving.isPending || updateSaving.isPending;
  const targetNum = parseFloat(target.replace(',', '.')) || 0;
  const savedNum = parseFloat(saved.replace(',', '.')) || 0;

  async function submit() {
    if (!title.trim() || targetNum <= 0) return;
    const payload = { title: title.trim(), target_amount: targetNum, saved_amount: savedNum, deadline, account_id: accountId };
    try {
      if (editing && goal) await updateSaving.mutateAsync({ id: goal.id, patch: payload });
      else await addSaving.mutateAsync(payload);
      onClose();
    } catch { toast('Не удалось сохранить', 'error'); }
  }

  async function del() {
    if (!goal) return;
    const ok = await confirm({ title: 'Удалить копилку?', danger: true, confirmLabel: 'Удалить' });
    if (!ok) return;
    try { await removeSaving.mutateAsync(goal.id); onClose(); }
    catch { toast('Не удалось удалить', 'error'); }
  }

  return (
    <Sheet
      open={open} onClose={onClose}
      title={editing ? 'Копилка' : 'Новая копилка'}
      footer={<Button full size="lg" disabled={busy || !title.trim() || targetNum <= 0} onClick={submit}>{editing ? 'Сохранить' : 'Создать'}</Button>}
    >
      <Field label="На что копишь">
        <Input autoFocus placeholder="Например: iPhone, отпуск" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <div className="mb-3.5">
        <Label>Цель (сумма)</Label>
        <AmountInput placeholder="0" value={target} onChange={(e) => setTarget(e.target.value)} />
      </div>
      <Field label="Уже накоплено">
        <Input inputMode="decimal" placeholder="0" value={saved} onChange={(e) => setSaved(e.target.value)} />
      </Field>
      <div className="mb-3.5">
        <Label>Срок</Label>
        <DateField value={deadline} onChange={setDeadline} />
      </div>
      {accounts.length > 0 && (
        <div className="mb-2">
          <Label>Счёт (необязательно)</Label>
          <div className="flex flex-wrap gap-2">
            <Chip active={accountId === null} onClick={() => setAccountId(null)}>Не привязан</Chip>
            {accounts.map((a) => (
              <Chip key={a.id} active={accountId === a.id} onClick={() => setAccountId(a.id)}>
                <span className="h-2 w-2 rounded-full" style={{ background: a.color }} />{a.name}
              </Chip>
            ))}
          </div>
        </div>
      )}
      {editing && (
        <button onClick={del} className="mt-3 flex items-center gap-2 text-[14px] text-[var(--negative)] font-medium">
          <Trash2 size={16} /> Удалить копилку
        </button>
      )}
    </Sheet>
  );
}
