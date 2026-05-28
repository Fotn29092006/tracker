'use client';

import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { haptics } from '@/lib/haptics';

// Swipe left to reveal + commit a delete. Snaps back if not past threshold.
export function SwipeRow({
  children,
  onDelete,
  disabled,
}: {
  children: React.ReactNode;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const x = useMotionValue(0);
  const iconScale = useTransform(x, [-120, -64, 0], [1.1, 1, 0.6]);
  const bgOpacity = useTransform(x, [-120, -20, 0], [1, 0.4, 0]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -110 || info.velocity.x < -600) {
      haptics.warning();
      onDelete();
    }
  };

  if (disabled) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-[var(--r-lg)]">
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-6 bg-[var(--negative)] rounded-[var(--r-lg)]"
        style={{ opacity: bgOpacity }}
      >
        <motion.span style={{ scale: iconScale }} className="text-white">
          <Trash2 size={20} />
        </motion.span>
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -130, right: 0 }}
        dragElastic={{ left: 0.4, right: 0 }}
        style={{ x }}
        onDragEnd={onDragEnd}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
}
