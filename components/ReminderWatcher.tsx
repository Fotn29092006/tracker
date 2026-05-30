'use client';

import { useEffect, useRef } from 'react';
import { useTasks } from '@/hooks/useTodo';
import { useOverlays } from '@/components/ui/Overlays';
import { showLocalNotification } from '@/lib/notify';
import { haptics } from '@/lib/haptics';

const FIRED_KEY = 'tracker-reminded';

function loadFired(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(FIRED_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveFired(set: Set<string>) {
  try { localStorage.setItem(FIRED_KEY, JSON.stringify([...set].slice(-200))); } catch { /* ignore */ }
}

// Mounted once in the shell. Fires due reminders while the app is alive.
export function ReminderWatcher() {
  const { data: tasks = [] } = useTasks();
  const { toast } = useOverlays();
  const fired = useRef(loadFired());
  // Read the latest tasks/toast through refs so the 30s interval is created ONCE
  // and never torn down + recreated on every task mutation (toggle/add/edit all
  // invalidate ['tasks']) — that churn sat on the hottest path in the app.
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      for (const t of tasksRef.current) {
        if (!t.reminder_at || t.done_at) continue;
        if (fired.current.has(t.id)) continue;
        const at = new Date(t.reminder_at).getTime();
        // fire within a 6-hour catch-up window so a reload doesn't miss it
        if (at <= now && now - at < 6 * 60 * 60 * 1000) {
          fired.current.add(t.id);
          saveFired(fired.current);
          haptics.warning();
          showLocalNotification('Напоминание', t.title);
          toastRef.current(`Напоминание: ${t.title}`, 'info');
        }
      }
    };
    check();
    const id = window.setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);

  // If a reminder was unset/rescheduled, allow it to fire again.
  useEffect(() => {
    const active = new Set(tasks.filter((t) => t.reminder_at && !t.done_at).map((t) => t.id));
    let changed = false;
    for (const id of fired.current) {
      if (!active.has(id)) { fired.current.delete(id); changed = true; }
    }
    if (changed) saveFired(fired.current);
  }, [tasks]);

  return null;
}
