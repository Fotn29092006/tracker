// ============================================================
// Domain types — 5 modules: To-Do, Finance, Workout, Notes, Profile.
// Mirrors supabase/migrations/0001_init.sql.
// ============================================================

export type Theme = 'dark' | 'light';
export type ThemeMode = Theme | 'auto';

// ── Profile ──────────────────────────────────────────────
export type Profile = {
  id: string;
  name: string;
  height_cm: number | null;
  theme: ThemeMode;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

// ── To-Do ────────────────────────────────────────────────
// A Goal is a bigger objective worked over many sessions; its progress
// is derived from the tasks that point at it (goal_id).
export type Goal = {
  id: string;
  user_id: string;
  title: string;
  note: string | null;
  target_date: string | null; // ISO date
  done_at: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  goal_id: string | null;          // null = standalone task
  title: string;
  note: string | null;
  due_date: string | null;         // ISO date; past + not done = "missed"
  reminder_at: string | null;      // ISO datetime; in-app reminder
  done_at: string | null;
  position: number;
  created_at: string;
};

export type GoalWithProgress = Goal & {
  total: number;
  done: number;
};

// ── Finance ──────────────────────────────────────────────
export type Account = {
  id: string;
  user_id: string;
  name: string;                    // "Kaspi", "Halyk", "Наличные"…
  currency: string;                // ISO 4217, default "KZT"
  initial_balance: number;         // balance at creation; current = initial + Σ tx
  color: string;                   // hex for the card accent
  position: number;
  archived_at: string | null;
  created_at: string;
};

export type AccountWithBalance = Account & { balance: number };

export type TxKind = 'income' | 'expense';

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string;
  kind: TxKind;
  amount: number;                  // always positive; kind gives the sign
  category: string | null;
  note: string | null;
  occurred_on: string;             // ISO date
  created_at: string;
};

export type DebtDirection = 'owed_to_me' | 'i_owe';

export type Debt = {
  id: string;
  user_id: string;
  direction: DebtDirection;
  counterparty: string;            // person's name
  amount: number;
  note: string | null;
  due_date: string | null;
  settled_at: string | null;
  created_at: string;
};

export type SavingsGoal = {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  saved_amount: number;
  deadline: string | null;
  account_id: string | null;       // optional linked account
  done_at: string | null;
  created_at: string;
};

// ── Workout ──────────────────────────────────────────────
export type MuscleId =
  | 'chest' | 'shoulders_front' | 'shoulders_rear' | 'biceps' | 'triceps'
  | 'forearms' | 'traps' | 'lats' | 'lower_back' | 'abs' | 'obliques'
  | 'glutes' | 'quads' | 'hamstrings' | 'calves';

export type ExerciseCategory = 'push' | 'pull' | 'legs' | 'core' | 'cardio' | 'compound';
export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'kettlebell' | 'other';

export type Exercise = {
  id: string;
  user_id: string | null;          // null = system catalogue
  name: string;
  category: ExerciseCategory;
  equipment: Equipment | null;
  muscle_distribution: Partial<Record<MuscleId, number>>; // % per muscle, ~sum 100
  is_system: boolean;
  created_at: string;
};

// One exercise sitting in a weekday's recurring plan ("каждый четверг").
export type PlanExercise = {
  id: string;
  user_id: string;
  day_of_week: number;             // 0 = Sunday … 6 = Saturday
  exercise_id: string;
  sets: number;
  reps: number;
  position: number;
  created_at: string;
};

// A logged occurrence — created when the user taps "Готово".
export type WorkoutSession = {
  id: string;
  user_id: string;
  performed_on: string;            // ISO date
  day_of_week: number;
  note: string | null;
  created_at: string;
};

// Snapshot of what was done in a session (copied from the plan).
export type SessionExercise = {
  id: string;
  session_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
};

// Weight + progress photo, by date. Written from Profile and from Workout.
export type BodyEntry = {
  id: string;
  user_id: string;
  recorded_on: string;             // ISO date
  weight_kg: number | null;
  photo_url: string | null;
  note: string | null;
  created_at: string;
};

// ── Notes ────────────────────────────────────────────────
export type Note = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  pinned: boolean;
  updated_at: string;
  created_at: string;
};
