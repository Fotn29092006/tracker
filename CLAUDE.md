# Трекер — guide for Claude Code

Personal daily-driver PWA (single user). Built fresh; the design is bespoke —
**do not** copy patterns from any older project.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase: Postgres + Auth + Storage, **RLS owner-only** on every table
- Tailwind v4 (tokens in `app/globals.css`), Framer Motion, lucide-react, Geist
- TanStack Query v5 + IndexedDB persist (`components/providers.tsx`) → offline-first
- PWA: `app/manifest.ts` + `public/sw.js`. **No Capacitor.** Deploy: Vercel.

> Next 16 note: middleware file is `proxy.ts` (the `middleware` convention is
> deprecated → renamed to `proxy`). Read `node_modules/next/dist/docs/` before
> using unfamiliar APIs — this Next has breaking changes vs training data.

## Scope — exactly 5 modules. Do NOT re-add anything else unless asked.
- **Задачи** (`components/todo/`): tasks with due date + in-app reminder
  (`components/ReminderWatcher.tsx`), overdue detection; Goals = multi-session
  collections of step-tasks (`goal_id`), progress derived from steps.
- **Финансы** (`components/finance/`): user-added accounts (Kaspi/Halyk…),
  balance = `initial_balance + Σ tx`; income/expense tied to an account; debts
  with direction (`owed_to_me`/`i_owe`); savings goals.
- **Тренировки** (`components/workout/`): weekly per-weekday plan; one-tap
  «Готово» snapshots the day's plan into a session; `BodyFigure` muscle map fed
  by effective-set math (`useMuscleVolume`); weight + progress photos.
- **Заметки** (`components/notes/`): simple, pin.
- **Профиль** (`components/profile/`): name, height, weight log + progress
  photos (Supabase Storage `progress` bucket), theme, PIN + Face ID lock.

Cut (don't reintroduce): habits, streaks, books, subscriptions, net-worth,
month/year reports, wrapped, pomodoro, achievements, AI insights, wellness.

## Conventions
- **Layout = app-shell** (`components/AppShell.tsx`): `h-dvh` flex frame, only the
  inner `<main id="app-scroll">` scrolls. The bottom nav (`TabBar`) is an
  IN-FLOW flex item — **never `position: fixed`** (a fixed bar mis-paints / jumps
  on iOS until first scroll). Don't reintroduce a fixed bottom bar.
- **No `backdrop-filter` on fixed/overlay elements** — it janks on iOS. Use solid
  backgrounds (tab bar, sheet/dialog overlays).
- **Motion is calm & non-compounding:** one opacity-only screen entrance
  (`app/(app)/template.tsx` — opacity only, NO transform, so the fixed FAB isn't
  re-rooted to a transformed ancestor). `TabPanel` is opacity-only; list stagger
  is a no-op (`lib/motion.ts`). Reserve motion for micro-interactions.
- **Inserts must stamp `user_id` via `await getUserId()`** (`lib/supabase/client.ts`),
  never a React-state value — avoids the cold-start race. Reads rely on RLS.
- Colour/spacing/radii = CSS variables in `globals.css`; theme switch = single
  `data-theme` attr on `<html>` (no JS palette). Anti-flash script in `layout.tsx`.
- Overlays (sheets, toasts, lightbox) render through `components/ui/Portal.tsx`
  (mounts after hydration → no hydration mismatch).
- Tab content uses `components/ui/TabPanel.tsx` (enter-only), **not**
  `AnimatePresence mode="wait"` (that added ~300ms switch latency).
- Auth: client-side `AuthGuard` (SPA-fast nav); session persists & auto-refreshes.
- Money/date helpers in `lib/utils.ts`; motion tokens in `lib/motion.ts`.

## Commands
```bash
npm run dev          # local
npm run build        # prod build (no eslint step; run `npx eslint .` separately)
```
Env: `.env.local` needs `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
DB: apply `supabase/migrations/*.sql` (0001 schema+RLS+trigger+bucket, 0002 exercise seed).

## Known follow-ups
- Email confirmation is ON in Supabase Auth → for frictionless single-user
  login, turn it off (Authentication → Email → Confirm email).
