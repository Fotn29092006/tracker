'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Wallet, 
  Dumbbell, 
  ListChecks, 
  Check as CheckIcon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Flame,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Check } from '@/components/ui/Check';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Skeleton } from '@/components/ui/Skeleton';
import { listContainer, listItem } from '@/lib/motion';
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

export default function PrototypeHomeScreen() {
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

  const monthSpend = useMemo(() => {
    const ym = today.slice(0, 7);
    return transactions.filter((t) => t.kind === 'expense' && t.occurred_on.startsWith(ym)).reduce((s, t) => s + t.amount, 0);
  }, [transactions, today]);

  const todayPlan = plan.filter((p) => p.day_of_week === todayDow);
  const doneToday = sessions.some((s) => s.performed_on === today);

  const name = profile?.name?.split(' ')[0] || '';

  const firstLoad = (tasksLoading || accLoading || sessionsLoading)
    && tasks.length === 0 && accounts.length === 0 && sessions.length === 0;

  if (firstLoad) {
    return (
      <div className="space-y-6 pt-4 pb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-11 w-11 rounded-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="rounded-3xl h-36" />
          <Skeleton className="rounded-3xl h-36" />
          <Skeleton className="rounded-3xl h-36" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-4 pb-12">
      {/* Header */}
      <header className="flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-subtle)] uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting()}, <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-cyan)] bg-clip-text text-transparent">{name || 'Гость'}</span>
          </h1>
        </motion.div>

        <Link href="/profile" className="group relative w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-[var(--on-accent)] shadow-lg shadow-[var(--accent-glow)]/20 transition-all hover:scale-105">
          <span className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-cyan)] transition-transform group-hover:scale-110" />
          <span className="relative z-10">{(name || profile?.name || '?').slice(0, 1).toUpperCase()}</span>
        </Link>
      </header>

      {/* Main Grid */}
      <motion.div 
        variants={listContainer} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 gap-6"
      >
        {/* Tasks Card */}
        <motion.div variants={listItem}>
          <Link href="/tasks">
            <div className="group relative rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[var(--border-strong)] overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-08)] rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--accent-08)] text-[var(--accent)] group-hover:scale-110 transition-transform">
                    <ListChecks size={20} />
                  </span>
                  <div>
                    <h2 className="text-[17px] font-bold">Задачи</h2>
                    <p className="text-xs text-[var(--text-subtle)]">На сегодня</p>
                  </div>
                </div>
                {activeTotal > 0 ? (
                  <span className="num text-xs font-bold rounded-full bg-[var(--accent-08)] text-[var(--accent)] border border-[var(--accent-20)] px-3 py-1">
                    {activeTotal} активных
                  </span>
                ) : (
                  <span className="text-xs font-bold rounded-full bg-[var(--positive-08)] text-[var(--positive)] border border-[var(--positive-16)] px-3 py-1">
                    Готово
                  </span>
                )}
              </div>

              {todayTasks.length === 0 ? (
                <div className="flex items-center gap-2 text-[14px] text-[var(--text-muted)] py-2">
                  <span className="w-8 h-8 rounded-xl bg-[var(--positive-08)] text-[var(--positive)] flex items-center justify-center shrink-0">
                    <CheckIcon size={16} />
                  </span>
                  <span>На сегодня всё выполнено. Отличная работа!</span>
                </div>
              ) : (
                <div className="space-y-3 py-1">
                  {todayTasks.map((t) => (
                    <div 
                      key={t.id} 
                      className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface-alt)]/50 hover:bg-[var(--surface-alt)] transition-colors cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggle.mutate(t);
                      }}
                    >
                      <Check size={22} checked={!!t.done_at} onChange={() => {}} />
                      <span className={cn(
                        "text-[14px] font-medium truncate flex-1",
                        t.done_at && "line-through text-[var(--text-muted)]"
                      )}>
                        {t.title}
                      </span>
                      {t.due_date && isPast(t.due_date) && !t.done_at && (
                        <span className="text-[10px] uppercase font-bold text-[var(--negative)] bg-[var(--negative-08)] px-2 py-0.5 rounded-md">
                          Просрочено
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Link>
        </motion.div>

        {/* Finance Card */}
        <motion.div variants={listItem}>
          <Link href="/finance">
            <div className="group relative rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[var(--border-strong)] overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-glow)]/5 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--accent-08)] text-[var(--accent)] group-hover:scale-110 transition-transform">
                    <Wallet size={20} />
                  </span>
                  <div>
                    <h2 className="text-[17px] font-bold">Финансы</h2>
                    <p className="text-xs text-[var(--text-subtle)]">Баланс и расходы</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[var(--text-subtle)] group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-[var(--surface-alt)]/50">
                  <p className="text-[12px] font-semibold text-[var(--text-subtle)] mb-1 uppercase tracking-wider">Всего на счетах</p>
                  <p className="num text-[22px] font-bold leading-tight text-[var(--text)]">
                    <AnimatedNumber value={total} format={fmtAmount} /> <span className="text-[var(--text-muted)] text-[14px]">{currencySymbol(currency)}</span>
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--surface-alt)]/50">
                  <p className="text-[12px] font-semibold text-[var(--text-subtle)] mb-1 uppercase tracking-wider">Траты в этом месяце</p>
                  <p className="num text-[22px] font-bold leading-tight text-[var(--negative)]">
                    −{fmtAmount(monthSpend)} <span className="text-[var(--text-muted)] text-[14px]">{currencySymbol(currency)}</span>
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Workout Card */}
        <motion.div variants={listItem}>
          <Link href="/workout">
            <div className="group relative rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[var(--border-strong)] overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-cyan)]/5 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--accent-08)] text-[var(--accent-cyan)] group-hover:scale-110 transition-transform">
                    <Dumbbell size={20} />
                  </span>
                  <div>
                    <h2 className="text-[17px] font-bold">Тренировки</h2>
                    <p className="text-xs text-[var(--text-subtle)]">Активность и расписание</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[var(--text-subtle)] group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="pt-1">
                {doneToday ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--positive-08)] border border-[var(--positive-16)]">
                    <span className="w-8 h-8 rounded-xl bg-[var(--positive)]/10 text-[var(--positive)] flex items-center justify-center shrink-0">
                      <Flame size={18} />
                    </span>
                    <div>
                      <p className="text-[14px] font-bold text-[var(--positive)]">Отличная работа!</p>
                      <p className="text-[12px] text-[var(--text-muted)]">Тренировка на сегодня выполнена.</p>
                    </div>
                  </div>
                ) : todayPlan.length > 0 ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--accent-08)]">
                    <span className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
                      <Dumbbell size={18} />
                    </span>
                    <div>
                      <p className="text-[14px] font-bold text-[var(--text)]">Запланирована тренировка</p>
                      <p className="text-[12px] text-[var(--text-muted)]">
                        {WEEKDAYS_FULL[todayDow]} · {todayPlan.length} упр.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface-alt)]/50">
                    <span className="w-8 h-8 rounded-xl bg-[var(--text-subtle)]/10 text-[var(--text-muted)] flex items-center justify-center shrink-0">
                      <Sparkles size={18} />
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold text-[var(--text-muted)]">Сегодня день отдыха</p>
                      <p className="text-[12px] text-[var(--text-subtle)]">Дайте мышцам восстановиться.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
