'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight, ArrowDownLeft, ListChecks, StickyNote, Dumbbell,
  ChevronLeft, X, Check, type LucideIcon,
} from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, AmountInput, Label } from '@/components/ui/Field';
import { Chip } from '@/components/ui/Pill';
import { useOverlays } from '@/components/ui/Overlays';
import { useAccounts, useFinanceMutations } from '@/hooks/useFinance';
import { useTaskMutations } from '@/hooks/useTodo';
import { useNoteMutations } from '@/hooks/useNotes';
import { usePlan, useSessions, useWorkoutMutations } from '@/hooks/useWorkout';
import { parseQuickTask } from '@/lib/parseQuickTask';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';
import { NOTE_TONES, NOTE_COLOR_ORDER } from '@/components/notes/noteColors';
import { ease } from '@/lib/motion';
import { haptics } from '@/lib/haptics';
import { cn, fmtDateLabel, todayISO, WEEKDAYS_FULL } from '@/lib/utils';
import type { NoteColor } from '@/lib/types';

type View = 'menu' | 'expense' | 'income' | 'task' | 'note' | 'workout';

const TITLES: Record<View, string> = {
  menu: 'Создать', expense: 'Расход', income: 'Доход',
  task: 'Новая задача', note: 'Заметка', workout: 'Тренировка',
};

// Directional slide between views. `custom={dir}` on AnimatePresence feeds the
// CURRENT direction to the exit variant too (so "back" slides the right way).
const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 28 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -28 }),
};

// Universal quick-capture hub. The single floating "+" (mounted in AppShell)
// opens this from any screen: pick a small block → a fast inline mini-form, no
// page navigation. Views slide left/right inside one sheet for a native feel.
export function QuickCreate({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [view, setView] = useState<View>('menu');
  const [dir, setDir] = useState(1);

  useEffect(() => { if (open) { setView('menu'); setDir(1); } }, [open]);

  const go = (v: View) => { haptics.tap(); setDir(1); setView(v); };
  const back = () => { setDir(-1); setView('menu'); };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="mb-4 flex items-center gap-1.5">
        {view !== 'menu' && (
          <button
            onClick={back}
            aria-label="Назад"
            className="-ml-1.5 grid h-8 w-8 place-items-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <h2 className="flex-1 text-[19px] font-semibold tracking-tight">{TITLES[view]}</h2>
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="grid h-8 w-8 place-items-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
        >
          <X size={18} />
        </button>
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={view}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: ease.out }}
          >
            {view === 'menu' && <Menu onPick={go} />}
            {view === 'expense' && <TxQuick kind="expense" onClose={onClose} />}
            {view === 'income' && <TxQuick kind="income" onClose={onClose} />}
            {view === 'task' && <TaskQuick onClose={onClose} />}
            {view === 'note' && <NoteQuick onClose={onClose} />}
            {view === 'workout' && <WorkoutQuick onClose={onClose} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Sheet>
  );
}

// ── Menu ────────────────────────────────────────────────
function Menu({ onPick }: { onPick: (v: View) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 pb-1">
      <Tile icon={ArrowUpRight} label="Расход" hint="Записать трату" bg="var(--negative-16)" fg="var(--negative)" onClick={() => onPick('expense')} />
      <Tile icon={ArrowDownLeft} label="Доход" hint="Записать доход" bg="var(--positive-16)" fg="var(--positive)" onClick={() => onPick('income')} />
      <Tile icon={ListChecks} label="Задача" hint="Что нужно сделать" bg="var(--accent-12)" fg="var(--accent)" onClick={() => onPick('task')} />
      <Tile icon={StickyNote} label="Заметка" hint="Быстрая мысль" bg="var(--warning-12)" fg="var(--warning)" onClick={() => onPick('note')} />
      <Tile icon={Dumbbell} label="Тренировка" hint="Отметить за сегодня" bg="var(--accent-12)" fg="var(--accent)" wide onClick={() => onPick('workout')} />
    </div>
  );
}

function Tile({
  icon: Icon, label, hint, bg, fg, wide, onClick,
}: {
  icon: LucideIcon; label: string; hint: string; bg: string; fg: string; wide?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-2.5 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition-transform active:scale-[0.97]',
        wide && 'col-span-2 flex-row items-center gap-3.5',
      )}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px]" style={{ background: bg, color: fg }}>
        <Icon size={22} />
      </span>
      <span className={wide ? '' : 'mt-0.5'}>
        <span className="block text-[15px] font-semibold">{label}</span>
        <span className="block text-[12px] text-[var(--text-subtle)]">{hint}</span>
      </span>
    </button>
  );
}

// ── Expense / Income ────────────────────────────────────
function TxQuick({ kind, onClose }: { kind: 'expense' | 'income'; onClose: () => void }) {
  const router = useRouter();
  const { data: accounts = [] } = useAccounts();
  const { addTransaction } = useFinanceMutations();
  const { toast } = useOverlays();

  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => { setAccountId((id) => id || accounts[0]?.id || ''); }, [accounts]);

  const presets = kind === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const amountNum = parseFloat(amount.replace(',', '.')) || 0;

  if (accounts.length === 0) {
    return (
      <div className="py-1">
        <p className="mb-4 text-[15px] text-[var(--text-muted)]">Сначала добавь счёт — куда записывать деньги.</p>
        <Button full size="lg" onClick={() => { onClose(); router.push('/finance'); }}>Перейти в Финансы</Button>
      </div>
    );
  }

  async function save() {
    if (amountNum <= 0 || !accountId) return;
    try {
      await addTransaction.mutateAsync({
        account_id: accountId, kind, amount: amountNum,
        category: category.trim() || null, note: null, occurred_on: todayISO(),
      });
      haptics.success();
      onClose();
    } catch { toast('Не удалось сохранить', 'error'); }
  }

  return (
    <div>
      <AmountInput
        autoFocus placeholder="0" value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ color: kind === 'income' ? 'var(--positive)' : 'var(--text)' }}
      />

      {accounts.length > 1 && (
        <div className="mt-4">
          <Label>Счёт</Label>
          <div className="flex flex-wrap gap-2">
            {accounts.map((a) => (
              <Chip key={a.id} active={accountId === a.id} onClick={() => setAccountId(a.id)}>
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: a.color }} />
                <span className="max-w-[150px] truncate">{a.name}</span>
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <Label>Категория</Label>
        <div className="flex flex-wrap gap-2">
          {presets.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? '' : c)}>{c}</Chip>
          ))}
        </div>
      </div>

      <Button full size="lg" className="mt-5" disabled={addTransaction.isPending || amountNum <= 0} onClick={save}>
        Добавить
      </Button>
    </div>
  );
}

// ── Task (smart input) ──────────────────────────────────
function TaskQuick({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('');
  const { add } = useTaskMutations();
  const { toast } = useOverlays();

  const parsed = parseQuickTask(text);
  const pills = [
    parsed.due && `📅 ${fmtDateLabel(parsed.due)}`,
    parsed.time && `⏰ ${parsed.time}`,
    parsed.tag && `# ${parsed.tag}`,
    parsed.priority === 'high' && '🔥 срочно',
  ].filter(Boolean) as string[];

  async function save() {
    if (!parsed.cleanTitle) return;
    const note = [parsed.tag && `#${parsed.tag}`, parsed.priority === 'high' && '🔥 срочно'].filter(Boolean).join(' ') || null;
    const reminder_at = parsed.time ? new Date(`${parsed.due ?? todayISO()}T${parsed.time}`).toISOString() : null;
    try {
      await add.mutateAsync({ title: parsed.cleanTitle, note, due_date: parsed.due ?? null, reminder_at });
      haptics.success();
      onClose();
    } catch { toast('Не удалось сохранить', 'error'); }
  }

  return (
    <div>
      <Input
        autoFocus value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); save(); } }}
        placeholder="напр. позвонить маме завтра в 18:00 #семья"
      />

      {pills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pills.map((h) => (
            <span key={h} className="rounded-full bg-[var(--accent-12)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent)]">{h}</span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {['сегодня', 'завтра', 'на неделе', '🔥 срочно'].map((c) => (
          <button
            key={c} type="button"
            onClick={() => setText((t) => `${t} ${c}`.trim())}
            className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-1.5 text-[12px] text-[var(--text-muted)] transition-transform active:scale-95"
          >
            {c}
          </button>
        ))}
      </div>

      <Button full size="lg" className="mt-5" disabled={!parsed.cleanTitle || add.isPending} onClick={save}>
        Добавить
      </Button>
    </div>
  );
}

// ── Note ────────────────────────────────────────────────
function NoteQuick({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState<NoteColor>('plain');
  const { add } = useNoteMutations();
  const { toast } = useOverlays();

  const can = !!(title.trim() || body.trim());

  async function save() {
    if (!can) return;
    try {
      await add.mutateAsync({ title: title.trim() || 'Без названия', body: body.trim() || null, color });
      haptics.success();
      onClose();
    } catch { toast('Не удалось сохранить', 'error'); }
  }

  return (
    <div>
      <Input autoFocus placeholder="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea className="mt-3" rows={4} placeholder="Текст заметки" value={body} onChange={(e) => setBody(e.target.value)} />

      <div className="mt-3.5 flex items-center gap-2.5">
        {NOTE_COLOR_ORDER.map((c) => {
          const tone = NOTE_TONES[c];
          const active = color === c;
          return (
            <button
              key={c} type="button" aria-label={c}
              onClick={() => setColor(c)}
              className="grid h-9 w-9 place-items-center rounded-full border-2 transition-colors"
              style={{ background: tone.bg, borderColor: active ? tone.dot : 'transparent' }}
            >
              {active
                ? <Check size={15} style={{ color: tone.dot }} strokeWidth={3} />
                : <span className="h-3 w-3 rounded-full" style={{ background: tone.dot }} />}
            </button>
          );
        })}
      </div>

      <Button full size="lg" className="mt-5" disabled={!can || add.isPending} onClick={save}>
        Сохранить
      </Button>
    </div>
  );
}

// ── Workout ─────────────────────────────────────────────
function WorkoutQuick({ onClose }: { onClose: () => void }) {
  const { data: plan = [] } = usePlan();
  const { data: sessions = [] } = useSessions();
  const { completeDay } = useWorkoutMutations();
  const { toast } = useOverlays();

  const today = todayISO();
  const dow = new Date().getDay();
  const todayPlan = plan.filter((p) => p.day_of_week === dow);
  const done = sessions.some((s) => s.performed_on === today);

  async function mark() {
    try {
      await completeDay.mutateAsync({ day_of_week: dow, date: today, planItems: todayPlan });
      haptics.success();
      onClose();
    } catch { toast('Не удалось сохранить', 'error'); }
  }

  if (done) {
    return (
      <div className="py-2 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--positive-16)] text-[var(--positive)]">
          <Check size={28} strokeWidth={3} />
        </span>
        <p className="mt-3 text-[15px] font-medium">Тренировка за сегодня уже отмечена</p>
        <Button full size="lg" variant="secondary" className="mt-5" onClick={onClose}>Закрыть</Button>
      </div>
    );
  }

  return (
    <div className="py-1">
      <div className="mb-4 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-[13px] text-[var(--text-subtle)]">{WEEKDAYS_FULL[dow]}</p>
        <p className="mt-0.5 text-[16px] font-semibold">
          {todayPlan.length > 0 ? `${todayPlan.length} упр. по плану` : 'На сегодня плана нет'}
        </p>
      </div>
      <Button full size="lg" disabled={completeDay.isPending} onClick={mark}>Отметить тренировку</Button>
    </div>
  );
}
