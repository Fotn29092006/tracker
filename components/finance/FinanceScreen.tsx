'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Pencil, ArrowDownLeft, ArrowUpRight, Wallet, HandCoins, PiggyBank, Check,
} from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import { Segmented } from '@/components/ui/Segmented';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Progress';
import { Sheet } from '@/components/ui/Sheet';
import { AmountInput } from '@/components/ui/Field';
import { useOverlays } from '@/components/ui/Overlays';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { TabPanel } from '@/components/ui/TabPanel';
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton';
import { listContainer, listItem, spring } from '@/lib/motion';
import { cn, fmtMoney, fmtAmount, fmtDateLabel, currencySymbol, todayISO } from '@/lib/utils';
import { categoryIcon } from '@/lib/categories';
import {
  useAccounts, useTransactions, useDebts, useSavingsGoals, useFinanceMutations,
} from '@/hooks/useFinance';
import { AccountForm } from './AccountForm';
import { TransactionForm } from './TransactionForm';
import { DebtForm } from './DebtForm';
import { SavingsGoalForm } from './SavingsGoalForm';
import { SpendingWheel } from './SpendingWheel';
import type { Account, AccountWithBalance, Debt, SavingsGoal, Transaction } from '@/lib/types';

type Tab = 'ops' | 'debts' | 'savings';

export function FinanceScreen() {
  const { data: accounts = [], total, isLoading: accLoading } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const { data: debts = [] } = useDebts();
  const { data: savings = [] } = useSavingsGoals();
  const { updateSaving, updateDebt } = useFinanceMutations();
  const { toast } = useOverlays();

  const [tab, setTab] = useState<Tab>('ops');
  const [accountForm, setAccountForm] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [txForm, setTxForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [debtForm, setDebtForm] = useState(false);
  const [editDebt, setEditDebt] = useState<Debt | null>(null);
  const [savingForm, setSavingForm] = useState(false);
  const [editSaving, setEditSaving] = useState<SavingsGoal | null>(null);
  const [contribute, setContribute] = useState<SavingsGoal | null>(null);

  const currency = accounts[0]?.currency ?? 'KZT';

  const month = useMemo(() => {
    const ym = todayISO().slice(0, 7);
    let income = 0, expense = 0;
    for (const t of transactions) {
      if (!t.occurred_on.startsWith(ym)) continue;
      if (t.kind === 'income') income += t.amount; else expense += t.amount;
    }
    return { income, expense };
  }, [transactions]);

  // This month's expenses grouped by category, biggest first — for the wheel.
  const spendBreakdown = useMemo<[string, number][]>(() => {
    const ym = todayISO().slice(0, 7);
    const m = new Map<string, number>();
    for (const t of transactions) {
      if (t.kind !== 'expense' || !t.occurred_on.startsWith(ym)) continue;
      const cat = t.category || 'Прочее';
      m.set(cat, (m.get(cat) ?? 0) + t.amount);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const accName = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  if (accLoading && accounts.length === 0 && transactions.length === 0) {
    return (
      <div>
        <AppHeader title="Финансы" />
        <Skeleton className="rounded-[var(--r-xl)] mb-4" style={{ height: 150 }} />
        <div className="flex gap-2.5 mb-5">
          <Skeleton className="rounded-[var(--r-md)]" style={{ height: 84, width: 150 }} />
          <Skeleton className="rounded-[var(--r-md)]" style={{ height: 84, width: 150 }} />
        </div>
        <Skeleton className="mb-5" style={{ height: 44 }} />
        <SkeletonList rows={4} height={64} />
      </div>
    );
  }

  return (
    <div>
      <AppHeader title="Финансы" />

      {/* Hero total */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring.soft}
        className="rounded-[var(--r-xl)] p-5 mb-4 relative overflow-hidden border border-[var(--border)] bg-[var(--surface)]"
      >
        <div aria-hidden className="absolute -right-8 -top-10 h-40 w-40 rounded-full blur-[60px] opacity-25" style={{ backgroundImage: 'var(--accent-grad)' }} />
        <p className="relative text-[13px] text-[var(--text-muted)] mb-1">Всего на счетах</p>
        <p className="relative num text-[clamp(30px,10vw,46px)] font-bold tracking-tight leading-none"><AnimatedNumber value={total} format={fmtAmount} /> <span className="text-[var(--text-muted)] text-[24px]">{currencySymbol(currency)}</span></p>
        <div className="relative mt-4 flex gap-5">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--positive-16)] text-[var(--positive)]"><ArrowDownLeft size={16} /></span>
            <div>
              <p className="text-[11px] text-[var(--text-subtle)] leading-none mb-0.5">Доход в этом месяце</p>
              <p className="num text-[15px] font-semibold text-[var(--positive)]">{fmtAmount(month.income)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--negative-16)] text-[var(--negative)]"><ArrowUpRight size={16} /></span>
            <div>
              <p className="text-[11px] text-[var(--text-subtle)] leading-none mb-0.5">Расход</p>
              <p className="num text-[15px] font-semibold text-[var(--negative)]">{fmtAmount(month.expense)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Accounts strip */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 mb-5">
        {accounts.map((a) => (
          <button
            key={a.id}
            onClick={() => { setEditAccount(a); setAccountForm(true); }}
            className="shrink-0 w-[150px] text-left rounded-[var(--r-md)] p-3.5 border border-[var(--border)] bg-[var(--surface)] relative overflow-hidden"
          >
            <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: a.color }} />
            <p className="text-[13px] text-[var(--text-muted)] truncate">{a.name}</p>
            <p className="num text-[18px] font-semibold mt-1"><AnimatedNumber value={a.balance} format={fmtAmount} /></p>
            <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">{currencySymbol(a.currency)}</p>
          </button>
        ))}
        <button
          onClick={() => { setEditAccount(null); setAccountForm(true); }}
          className="shrink-0 w-[110px] grid place-items-center rounded-[var(--r-md)] border border-dashed border-[var(--border-strong)] text-[var(--text-muted)] gap-1"
        >
          <Plus size={20} />
          <span className="text-[12px] font-medium">Счёт</span>
        </button>
      </div>

      <Segmented<Tab>
        id="fin-tab" className="mb-5" value={tab} onChange={setTab}
        options={[{ value: 'ops', label: 'Операции' }, { value: 'debts', label: 'Долги' }, { value: 'savings', label: 'Копилки' }]}
      />

      <TabPanel key={tab}>
        {tab === 'ops' && (
          <div className="space-y-5">
            {month.expense > 0 && spendBreakdown.length > 0 && (
              <div className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="mb-3.5 text-[13px] font-semibold">Куда уходят деньги</p>
                <SpendingWheel breakdown={spendBreakdown} total={month.expense} />
              </div>
            )}
            <Operations transactions={transactions} accName={accName} onEdit={(t) => { setEditTx(t); setTxForm(true); }} onAdd={() => { setEditTx(null); setTxForm(true); }} />
          </div>
        )}
        {tab === 'debts' && (
          <Debts debts={debts} currency={currency} onEdit={(d) => { setEditDebt(d); setDebtForm(true); }} onAdd={() => { setEditDebt(null); setDebtForm(true); }}
            onSettle={(d) => updateDebt.mutate(
            { id: d.id, patch: { settled_at: d.settled_at ? null : new Date().toISOString() } },
            { onError: () => toast('Не удалось обновить', 'error') },
          )} />
        )}
        {tab === 'savings' && (
          <Savings goals={savings} currency={currency} onEdit={(g) => { setEditSaving(g); setSavingForm(true); }} onAdd={() => { setEditSaving(null); setSavingForm(true); }} onContribute={setContribute} />
        )}
      </TabPanel>

      <AccountForm open={accountForm} onClose={() => setAccountForm(false)} account={editAccount} />
      <TransactionForm open={txForm} onClose={() => setTxForm(false)} accounts={accounts} tx={editTx} onNeedAccount={() => { setEditAccount(null); setAccountForm(true); }} />
      <DebtForm open={debtForm} onClose={() => setDebtForm(false)} debt={editDebt} />
      <SavingsGoalForm open={savingForm} onClose={() => setSavingForm(false)} goal={editSaving} accounts={accounts} />

      <ContributeSheet
        goal={contribute}
        busy={updateSaving.isPending}
        onClose={() => setContribute(null)}
        onConfirm={async (addAmount) => {
          if (!contribute) return;
          const next = Math.max(0, contribute.saved_amount + addAmount);
          try {
            await updateSaving.mutateAsync({ id: contribute.id, patch: { saved_amount: next, done_at: next >= contribute.target_amount ? new Date().toISOString() : null } });
            setContribute(null);
          } catch { toast('Не удалось сохранить', 'error'); }
        }}
      />
    </div>
  );
}

// ── Operations ──────────────────────────────────────────
function Operations({
  transactions, accName, onEdit, onAdd,
}: {
  transactions: Transaction[];
  accName: Map<string, AccountWithBalance>;
  onEdit: (t: Transaction) => void;
  onAdd: () => void;
}) {
  const groups = useMemo(() => {
    const m = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const arr = m.get(t.occurred_on) ?? [];
      arr.push(t); m.set(t.occurred_on, arr);
    }
    return [...m.entries()];
  }, [transactions]);

  if (transactions.length === 0) {
    return <EmptyState icon={Wallet} title="Операций пока нет" hint="Записывай доходы и расходы — баланс пересчитается сам." action={<Button onClick={onAdd}>Добавить операцию</Button>} />;
  }

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-5">
      {groups.map(([date, items]) => (
        <div key={date}>
          <p className="text-[13px] font-medium text-[var(--text-subtle)] mb-2 px-1">{fmtDateLabel(date)}</p>
          <div className="space-y-2">
            {items.map((t) => {
              const Icon = categoryIcon(t.category);
              const acc = accName.get(t.account_id);
              return (
                <motion.button
                  key={t.id} variants={listItem} whileTap={{ scale: 0.99 }}
                  onClick={() => onEdit(t)}
                  className="w-full text-left flex items-center gap-3 rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--border)] p-3"
                >
                  <span className={cn('grid h-10 w-10 place-items-center rounded-full', t.kind === 'income' ? 'bg-[var(--positive-16)] text-[var(--positive)]' : 'bg-[var(--surface-alt)] text-[var(--text-muted)]')}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium truncate">{t.category || (t.kind === 'income' ? 'Доход' : 'Расход')}</p>
                    <p className="text-[12px] text-[var(--text-subtle)] truncate">
                      {acc?.name}{t.note ? ` · ${t.note}` : ''}
                    </p>
                  </div>
                  <span className={cn('num text-[15px] font-semibold shrink-0', t.kind === 'income' ? 'text-[var(--positive)]' : 'text-[var(--text)]')}>
                    {t.kind === 'income' ? '+' : '−'}{fmtAmount(t.amount)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ── Debts ───────────────────────────────────────────────
function Debts({
  debts, currency, onEdit, onAdd, onSettle,
}: {
  debts: Debt[];
  currency: string;
  onEdit: (d: Debt) => void;
  onAdd: () => void;
  onSettle: (d: Debt) => void;
}) {
  const active = debts.filter((d) => !d.settled_at);
  const toMe = active.filter((d) => d.direction === 'owed_to_me');
  const iOwe = active.filter((d) => d.direction === 'i_owe');
  const settled = debts.filter((d) => d.settled_at);
  const sum = (arr: Debt[]) => arr.reduce((s, d) => s + d.amount, 0);

  if (debts.length === 0) {
    return <EmptyState icon={HandCoins} title="Долгов нет" hint="Веди, кто тебе должен и кому должен ты." action={<Button onClick={onAdd}>Добавить долг</Button>} />;
  }

  return (
    <div className="space-y-6">
      <DebtGroup title="Мне должны" tone="positive" total={sum(toMe)} currency={currency} debts={toMe} onEdit={onEdit} onSettle={onSettle} />
      <DebtGroup title="Я должен" tone="negative" total={sum(iOwe)} currency={currency} debts={iOwe} onEdit={onEdit} onSettle={onSettle} />
      {settled.length > 0 && (
        <div>
          <p className="text-[13px] font-medium text-[var(--text-subtle)] mb-2 px-1">Закрыто</p>
          <div className="space-y-2">
            {settled.map((d) => <DebtRow key={d.id} debt={d} onEdit={onEdit} onSettle={onSettle} />)}
          </div>
        </div>
      )}
      <AddRow label="Новый долг" onClick={onAdd} />
    </div>
  );
}

function DebtGroup({ title, tone, total, currency, debts, onEdit, onSettle }: {
  title: string; tone: 'positive' | 'negative'; total: number; currency: string;
  debts: Debt[]; onEdit: (d: Debt) => void; onSettle: (d: Debt) => void;
}) {
  if (debts.length === 0) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--text-subtle)]">{title}</h2>
        <span className={cn('num text-[15px] font-bold', tone === 'positive' ? 'text-[var(--positive)]' : 'text-[var(--negative)]')}>
          {fmtMoney(total, currency)}
        </span>
      </div>
      <div className="space-y-2">
        {debts.map((d) => <DebtRow key={d.id} debt={d} onEdit={onEdit} onSettle={onSettle} />)}
      </div>
    </div>
  );
}

function DebtRow({ debt, onEdit, onSettle }: { debt: Debt; onEdit: (d: Debt) => void; onSettle: (d: Debt) => void }) {
  const settled = !!debt.settled_at;
  return (
    <div className="flex items-center gap-3 rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--border)] p-3">
      <button
        onClick={() => onSettle(debt)}
        className={cn('grid h-9 w-9 place-items-center rounded-full shrink-0 transition-colors', settled ? 'bg-[var(--positive)] text-[var(--on-accent)]' : 'border-2 border-[var(--border-strong)] text-transparent')}
        aria-label={settled ? 'Вернуть в активные' : 'Отметить закрытым'}
      >
        <motion.span initial={false} animate={{ scale: settled ? 1 : 0 }} transition={{ type: 'spring', stiffness: 600, damping: 20 }}>
          <Check size={16} strokeWidth={3} />
        </motion.span>
      </button>
      <button onClick={() => onEdit(debt)} className="min-w-0 flex-1 text-left">
        <p className={cn('text-[15px] font-medium truncate', settled && 'line-through text-[var(--text-subtle)]')}>{debt.counterparty}</p>
        {debt.note && <p className="text-[12px] text-[var(--text-subtle)] truncate">{debt.note}</p>}
        {debt.due_date && !settled && <p className="text-[12px] text-[var(--text-muted)]">до {fmtDateLabel(debt.due_date)}</p>}
      </button>
      <span className={cn('num text-[15px] font-semibold shrink-0', settled ? 'text-[var(--text-subtle)]' : debt.direction === 'owed_to_me' ? 'text-[var(--positive)]' : 'text-[var(--negative)]')}>
        {fmtAmount(debt.amount)}
      </span>
    </div>
  );
}

// ── Savings ─────────────────────────────────────────────
function Savings({ goals, currency, onEdit, onAdd, onContribute }: {
  goals: SavingsGoal[]; currency: string;
  onEdit: (g: SavingsGoal) => void; onAdd: () => void; onContribute: (g: SavingsGoal) => void;
}) {
  if (goals.length === 0) {
    return <EmptyState icon={PiggyBank} title="Копилок нет" hint="Поставь цель и откладывай к ней." action={<Button onClick={onAdd}>Создать копилку</Button>} />;
  }
  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3">
      {goals.map((g) => {
        const ratio = g.target_amount ? g.saved_amount / g.target_amount : 0;
        const done = g.saved_amount >= g.target_amount;
        return (
          <motion.div key={g.id} variants={listItem} className="rounded-[var(--r-lg)] bg-[var(--surface)] border border-[var(--border)] p-4">
            <div className="flex items-start justify-between gap-2">
              <button onClick={() => onEdit(g)} className="min-w-0 text-left">
                <p className="text-[16px] font-semibold truncate">{g.title}</p>
                <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
                  <span className="num">{fmtAmount(g.saved_amount)}</span> из <span className="num">{fmtMoney(g.target_amount, currency)}</span>
                  {g.deadline && ` · до ${fmtDateLabel(g.deadline)}`}
                </p>
              </button>
              {done
                ? <span className="text-[var(--positive)] text-[13px] font-semibold shrink-0">Готово 🎉</span>
                : <button onClick={() => onContribute(g)} className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[var(--accent-12)] text-[var(--accent)] px-3 h-8 text-[13px] font-semibold"><Plus size={15} /> Внести</button>}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1"><ProgressBar value={ratio} tone={done ? 'positive' : 'accent'} /></div>
              <span className="num text-[13px] font-semibold text-[var(--text-muted)] w-10 text-right">{Math.round(ratio * 100)}%</span>
            </div>
          </motion.div>
        );
      })}
      <AddRow label="Новая копилка" onClick={onAdd} />
    </motion.div>
  );
}

// Dashed inline "add" affordance (replaces the old per-tab FAB for the
// secondary finance entities; the floating "+" is now the universal hub).
function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-[var(--r-lg)] border border-dashed border-[var(--border-strong)] py-3.5 text-[14px] font-medium text-[var(--text-muted)] transition-transform active:scale-[0.99]"
    >
      <Plus size={17} /> {label}
    </button>
  );
}

// ── Contribute sheet ────────────────────────────────────
function ContributeSheet({ goal, busy, onClose, onConfirm }: {
  goal: SavingsGoal | null; busy?: boolean; onClose: () => void; onConfirm: (add: number) => void;
}) {
  const [val, setVal] = useState('');
  const num = parseFloat(val.replace(',', '.')) || 0;
  return (
    <Sheet
      open={!!goal} onClose={() => { setVal(''); onClose(); }}
      title={goal ? `Внести в «${goal.title}»` : ''}
      footer={<Button full size="lg" disabled={num <= 0 || busy} onClick={() => { onConfirm(num); setVal(''); }}>Внести</Button>}
    >
      <AmountInput autoFocus placeholder="0" value={val} onChange={(e) => setVal(e.target.value)} />
      {goal && <p className="mt-3 text-[13px] text-[var(--text-muted)]">Сейчас накоплено: <span className="num">{fmtAmount(goal.saved_amount)}</span></p>}
    </Sheet>
  );
}
