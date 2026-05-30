'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Wallet, Dumbbell, ListChecks, Check as CheckIcon } from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import { NextUpCard } from '@/components/home/NextUpCard';
import { Check } from '@/components/ui/Check';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Skeleton } from '@/components/ui/Skeleton';
import { Sparkline } from '@/components/ui/Sparkline';
import { listContainer, listItem, ease } from '@/lib/motion';
import { cn, fmtAmount, currencySymbol, todayISO, isPast, WEEKDAYS_FULL } from '@/lib/utils';
import { useTasks, useTaskMutations } from '@/hooks/useTodo';
import { useAccounts, useTransactions } from '@/hooks/useFinance';
import { usePlan, useSessions } from '@/hooks/useWorkout';
import { useProfile } from '@/hooks/useProfile';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export function HomeScreen() {
  const { data: profile } = useProfile();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { toggle } = useTaskMutations();
  const { data: accounts = [], total, isLoading: accLoading } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const { data: plan = [] } = usePlan();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();

  const today = todayISO();
  const todayDow = new Date().getDay();
  const currency = accounts[0]?.currency ?? 'KZT';

  const todayTasks = useMemo(
    () => tasks.filter((t) => !t.done_at && (t.due_date === today || (t.due_date && isPast(t.due_date)))).slice(0, 4),
    [tasks, today],
  );
  const activeTotal = tasks.filter((t) => !t.done_at && (t.due_date === today || (t.due_date && isPast(t.due_date)))).length;

  // Today's completion: done-today vs everything on today's plate.
  const doneTodayCount = useMemo(
    () => tasks.filter((t) => t.done_at && t.done_at.slice(0, 10) === today).length,
    [tasks, today],
  );
  const totalToday = activeTotal + doneTodayCount;
  const taskRatio = totalToday ? doneTodayCount / totalToday : 0;

  const monthSpend = useMemo(() => {
    const ym = today.slice(0, 7);
    return transactions.filter((t) => t.kind === 'expense' && t.occurred_on.startsWith(ym)).reduce((s, t) => s + t.amount, 0);
  }, [transactions, today]);

  // Last-14-day daily expense series for the Finance card sparkline.
  const spendSeries = useMemo(() => {
    const days = 14;
    const buckets = new Array<number>(days).fill(0);
    const t0 = new Date(`${today}T00:00:00`).getTime();
    for (const tx of transactions) {
      if (tx.kind !== 'expense') continue;
      const diff = Math.round((t0 - new Date(`${tx.occurred_on}T00:00:00`).getTime()) / 86400000);
      if (diff >= 0 && diff < days) buckets[days - 1 - diff] += tx.amount;
    }
    return buckets;
  }, [transactions, today]);

  const todayPlan = plan.filter((p) => p.day_of_week === todayDow);
  const doneToday = sessions.some((s) => s.performed_on === today);

  const name = profile?.name?.split(' ')[0] || '';

  const firstLoad = (tasksLoading || accLoading || sessionsLoading)
    && tasks.length === 0 && accounts.length === 0 && sessions.length === 0;

  if (firstLoad) {
    return (
      <div>
        <AppHeader title={greeting()} subtitle={name || undefined} />
        <div className="space-y-3.5">
          <Skeleton className="rounded-[var(--r-lg)]" style={{ height: 132 }} />
          <Skeleton className="rounded-[var(--r-lg)]" style={{ height: 96 }} />
          <Skeleton className="rounded-[var(--r-lg)]" style={{ height: 84 }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader
        title={greeting()}
        subtitle={name || undefined}
        right={
          <Link href="/profile" aria-label="Профиль" className="grid h-11 w-11 place-items-center rounded-full text-[16px] font-bold text-[var(--on-accent)]" style={{ backgroundImage: 'var(--accent-grad)' }}>
            {(name || profile?.name || '?').slice(0, 1).toUpperCase()}
          </Link>
        }
      />

      <div className="mb-3.5">
        <NextUpCard />
      </div>

      <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-3.5">
        {/* Tasks */}
        <motion.div variants={listItem}>
          <DashCard href="/tasks" icon={ListChecks} title="Задачи на сегодня" badge={activeTotal > 0 ? String(activeTotal) : undefined}>
            {todayTasks.length === 0 ? (
              <div className="flex items-center gap-2 text-[14px] text-[var(--text-muted)] pt-1">
                <CheckIcon size={16} className="text-[var(--positive)]" /> На сегодня всё чисто
              </div>
            ) : (
              <div className="pt-1.5">
                <div className="mb-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-[var(--text-subtle)]">Прогресс дня</span>
                    <span className="num text-[12px] font-semibold text-[var(--text-muted)]">{doneTodayCount}/{totalToday}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--surface-alt)] overflow-hidden">
                    <motion.div
                      className="h-full w-full origin-left rounded-full"
                      style={{ backgroundImage: 'var(--accent-grad)' }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: taskRatio }}
                      transition={{ duration: 0.5, ease: ease.out }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {todayTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2.5">
                      <Check size={22} checked={!!t.done_at} onChange={() => toggle.mutate(t)} />
                      <span className="text-[14px] truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DashCard>
        </motion.div>

        {/* Finance */}
        <motion.div variants={listItem}>
          <DashCard href="/finance" icon={Wallet} title="Финансы">
            <div className="flex items-end justify-between pt-1">
              <div>
                <p className="text-[12px] text-[var(--text-subtle)]">На счетах</p>
                <p className="num text-[24px] font-bold leading-tight"><AnimatedNumber value={total} format={fmtAmount} /> <span className="text-[var(--text-muted)] text-[16px]">{currencySymbol(currency)}</span></p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[var(--text-subtle)]">Траты за месяц</p>
                <p className="num text-[16px] font-semibold text-[var(--negative)]">−{fmtAmount(monthSpend)}</p>
              </div>
            </div>
            {spendSeries.some((v) => v > 0) && (
              <div className="mt-3"><Sparkline points={spendSeries} height={34} /></div>
            )}
          </DashCard>
        </motion.div>

        {/* Workout */}
        <motion.div variants={listItem}>
          <DashCard href="/workout" icon={Dumbbell} title="Тренировка">
            <div className="pt-1">
              {doneToday ? (
                <p className="flex items-center gap-2 text-[14px] font-medium text-[var(--positive)]"><CheckIcon size={16} /> Выполнено сегодня</p>
              ) : todayPlan.length > 0 ? (
                <p className="text-[14px] text-[var(--text)]"><span className="font-semibold">{WEEKDAYS_FULL[todayDow]}</span> · {todayPlan.length} упр. запланировано</p>
              ) : (
                <p className="text-[14px] text-[var(--text-muted)]">Сегодня день отдыха</p>
              )}
            </div>
          </DashCard>
        </motion.div>
      </motion.div>
    </div>
  );
}

function DashCard({
  href, icon: Icon, title, badge, children,
}: {
  href: string;
  icon: typeof Wallet;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileTap={{ scale: 0.985 }}
        className="rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[var(--accent-12)] text-[var(--accent)]"><Icon size={17} /></span>
          <span className="text-[15px] font-semibold flex-1">{title}</span>
          {badge && <span className={cn('num text-[12px] font-bold rounded-full bg-[var(--accent-12)] text-[var(--accent)] px-2 py-0.5')}>{badge}</span>}
          <ChevronRight size={18} className="text-[var(--text-subtle)]" />
        </div>
        {children}
      </motion.div>
    </Link>
  );
}
