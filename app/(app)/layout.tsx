import { AppShell } from '@/components/AppShell';

// No server-side auth or data here — the shell is static and prefetchable, so
// navigation between screens is instant. Auth is gated on the client
// (AuthGuard inside AppShell); data is protected by Supabase RLS.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
