-- ============================================================
-- Tracker — initial schema. Five modules: To-Do, Finance, Workout,
-- Notes, Profile. RLS owner-only everywhere; exercises catalogue is
-- shared (system rows) + per-user additions.
-- ============================================================

-- ── PROFILES ──────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  height_cm   numeric,
  theme       text not null default 'dark' check (theme in ('dark','light','auto')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_self" on public.profiles for all
  to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end; $$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generic updated_at touch.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ── TO-DO: goals + tasks ──────────────────────────────────
create table public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  note        text,
  target_date date,
  done_at     timestamptz,
  created_at  timestamptz not null default now()
);
alter table public.goals enable row level security;
create policy "goals_owner" on public.goals for all
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index goals_user_idx on public.goals (user_id, created_at desc);

create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  goal_id     uuid references public.goals(id) on delete cascade,
  title       text not null,
  note        text,
  due_date    date,
  reminder_at timestamptz,
  done_at     timestamptz,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);
alter table public.tasks enable row level security;
create policy "tasks_owner" on public.tasks for all
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index tasks_user_due_idx on public.tasks (user_id, due_date);
create index tasks_goal_idx on public.tasks (goal_id) where goal_id is not null;

-- ── FINANCE: accounts, transactions, debts, savings goals ─
create table public.accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  currency        text not null default 'KZT',
  initial_balance numeric not null default 0,
  color           text not null default '#5B8CFF',
  position        integer not null default 0,
  archived_at     timestamptz,
  created_at      timestamptz not null default now()
);
alter table public.accounts enable row level security;
create policy "accounts_owner" on public.accounts for all
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index accounts_user_idx on public.accounts (user_id, position);

create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  account_id  uuid not null references public.accounts(id) on delete cascade,
  kind        text not null check (kind in ('income','expense')),
  amount      numeric not null check (amount >= 0),
  category    text,
  note        text,
  occurred_on date not null default (now() at time zone 'utc')::date,
  created_at  timestamptz not null default now()
);
alter table public.transactions enable row level security;
create policy "transactions_owner" on public.transactions for all
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index transactions_user_date_idx on public.transactions (user_id, occurred_on desc);
create index transactions_account_idx on public.transactions (account_id);

create table public.debts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  direction   text not null check (direction in ('owed_to_me','i_owe')),
  counterparty text not null,
  amount      numeric not null check (amount >= 0),
  note        text,
  due_date    date,
  settled_at  timestamptz,
  created_at  timestamptz not null default now()
);
alter table public.debts enable row level security;
create policy "debts_owner" on public.debts for all
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index debts_user_idx on public.debts (user_id, settled_at);

create table public.savings_goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  target_amount numeric not null check (target_amount > 0),
  saved_amount  numeric not null default 0,
  deadline      date,
  account_id    uuid references public.accounts(id) on delete set null,
  done_at       timestamptz,
  created_at    timestamptz not null default now()
);
alter table public.savings_goals enable row level security;
create policy "savings_goals_owner" on public.savings_goals for all
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index savings_goals_user_idx on public.savings_goals (user_id, created_at desc);

-- ── WORKOUT ───────────────────────────────────────────────
create table public.exercises (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade, -- null = system
  name                text not null,
  category            text not null check (category in ('push','pull','legs','core','cardio','compound')),
  equipment           text check (equipment in ('barbell','dumbbell','machine','cable','bodyweight','kettlebell','other')),
  muscle_distribution jsonb not null,
  is_system           boolean not null default false,
  created_at          timestamptz not null default now()
);
alter table public.exercises enable row level security;
create policy "exercises_select" on public.exercises for select
  to authenticated using (is_system = true or auth.uid() = user_id);
create policy "exercises_insert_own" on public.exercises for insert
  to authenticated with check (auth.uid() = user_id and is_system = false);
create policy "exercises_update_own" on public.exercises for update
  to authenticated using (auth.uid() = user_id and is_system = false);
create policy "exercises_delete_own" on public.exercises for delete
  to authenticated using (auth.uid() = user_id and is_system = false);
create index exercises_user_idx on public.exercises (user_id) where user_id is not null;

-- Weekly recurring plan: which exercises sit on which weekday.
create table public.plan_exercises (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  day_of_week  integer not null check (day_of_week between 0 and 6),
  exercise_id  uuid not null references public.exercises(id) on delete cascade,
  sets         integer not null default 3 check (sets > 0),
  reps         integer not null default 10 check (reps >= 0),
  position     integer not null default 0,
  created_at   timestamptz not null default now()
);
alter table public.plan_exercises enable row level security;
create policy "plan_exercises_owner" on public.plan_exercises for all
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index plan_exercises_user_day_idx on public.plan_exercises (user_id, day_of_week, position);

-- A logged workout occurrence (created on "Готово").
create table public.workout_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  performed_on date not null default (now() at time zone 'utc')::date,
  day_of_week  integer not null check (day_of_week between 0 and 6),
  note         text,
  created_at   timestamptz not null default now()
);
alter table public.workout_sessions enable row level security;
create policy "workout_sessions_owner" on public.workout_sessions for all
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index workout_sessions_user_idx on public.workout_sessions (user_id, performed_on desc);

create table public.session_exercises (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  sets        integer not null default 0,
  reps        integer not null default 0
);
alter table public.session_exercises enable row level security;
create policy "session_exercises_owner" on public.session_exercises for all
  to authenticated
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));
create index session_exercises_session_idx on public.session_exercises (session_id);

-- Body weight + progress photo, by date.
create table public.body_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  recorded_on date not null default (now() at time zone 'utc')::date,
  weight_kg   numeric,
  photo_url   text,
  note        text,
  created_at  timestamptz not null default now()
);
alter table public.body_entries enable row level security;
create policy "body_entries_owner" on public.body_entries for all
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index body_entries_user_idx on public.body_entries (user_id, recorded_on desc);

-- ── NOTES ─────────────────────────────────────────────────
create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default '',
  body        text,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.notes enable row level security;
create policy "notes_owner" on public.notes for all
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index notes_user_idx on public.notes (user_id, pinned desc, updated_at desc);
create trigger notes_touch before update on public.notes
  for each row execute function public.touch_updated_at();

-- ── STORAGE: progress photos ──────────────────────────────
insert into storage.buckets (id, name, public)
values ('progress', 'progress', true)
on conflict (id) do nothing;

create policy "progress_read" on storage.objects for select
  to authenticated using (bucket_id = 'progress' and owner = auth.uid());
create policy "progress_insert" on storage.objects for insert
  to authenticated with check (bucket_id = 'progress' and owner = auth.uid());
create policy "progress_delete" on storage.objects for delete
  to authenticated using (bucket_id = 'progress' and owner = auth.uid());
