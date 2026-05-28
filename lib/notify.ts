// In-app reminders. We don't run server-side web-push; instead, while the
// app is open (or in the background as an installed PWA) a watcher fires a
// local Notification when a task's reminder time arrives.

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const res = await Notification.requestPermission();
    return res === 'granted';
  } catch {
    return false;
  }
}

export function showLocalNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/icon', tag: title });
  } catch {
    // Some browsers require the SW registration to show notifications.
    navigator.serviceWorker?.ready
      .then((reg) => reg.showNotification(title, { body, icon: '/icon', tag: title }))
      .catch(() => {});
  }
}
