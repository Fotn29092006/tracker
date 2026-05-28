'use client';

import { cn } from '@/lib/utils';

// Shimmer placeholder (uses the .skeleton class from globals.css).
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn('skeleton rounded-[12px]', className)} style={style} />;
}

// A stack of placeholder cards for list screens while first load resolves.
export function SkeletonList({ rows = 5, height = 64 }: { rows?: number; height?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="rounded-[var(--r-lg)]" style={{ height }} />
      ))}
    </div>
  );
}
