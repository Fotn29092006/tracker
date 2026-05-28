'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ease } from '@/lib/motion';

type Mode = 'signin' | 'signup';

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null); setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/');
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { data: { name } },
        });
        if (error) throw error;
        if (data.session) {
          router.replace('/');
          router.refresh();
        } else {
          setInfo('Аккаунт создан. Подтверди почту по ссылке из письма, затем войди.');
          setMode('signin');
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Что-то пошло не так';
      setError(translate(msg));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-dvh flex flex-col justify-center px-6 overflow-hidden">
      {/* ambient aurora glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full blur-[120px] opacity-40"
        style={{ backgroundImage: 'var(--accent-grad)' }}
      />

      <div className="relative w-full max-w-[400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: ease.out }}
        >
          {/* brand mark */}
          <div className="flex items-end gap-[5px] mb-7">
            <span className="grid h-12 w-12 place-items-center rounded-[16px]" style={{ backgroundImage: 'var(--accent-grad)' }}>
              <span className="flex items-end gap-[3px] pb-1">
                <i className="block w-1 h-2.5 rounded-sm bg-[#07101F]" />
                <i className="block w-1 h-4 rounded-sm bg-[#07101F]" />
                <i className="block w-1 h-5 rounded-sm bg-[#07101F]" />
              </span>
            </span>
          </div>

          <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-tight">
            {mode === 'signin' ? 'С возвращением' : 'Создать аккаунт'}
          </h1>
          <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">
            Задачи, финансы и тренировки — в одном месте.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-3">
            <AnimatePresence initial={false}>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </motion.div>
              )}
            </AnimatePresence>
            <Input type="email" placeholder="Почта" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />

            {error && <p className="text-[13px] text-[var(--negative)] px-1">{error}</p>}
            {info && <p className="text-[13px] text-[var(--positive)] px-1">{info}</p>}

            <Button type="submit" size="lg" full disabled={busy} className="mt-1">
              {busy ? <Loader2 size={18} className="animate-spin" /> : mode === 'signin' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
          </form>

          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null); }}
            className="mt-5 w-full text-center text-[14px] text-[var(--text-muted)]"
          >
            {mode === 'signin' ? (
              <>Нет аккаунта? <span className="text-[var(--accent)] font-medium">Регистрация</span></>
            ) : (
              <>Уже есть аккаунт? <span className="text-[var(--accent)] font-medium">Войти</span></>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function translate(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'Неверная почта или пароль';
  if (/already registered|already exists/i.test(msg)) return 'Эта почта уже зарегистрирована';
  if (/password should be at least/i.test(msg)) return 'Пароль слишком короткий (мин. 6 символов)';
  if (/email.*invalid|invalid.*email/i.test(msg)) return 'Некорректная почта';
  return msg;
}
