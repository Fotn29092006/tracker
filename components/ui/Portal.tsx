'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Renders children into <body>, but only after mount. This keeps server and
// first client render identical (both render nothing), avoiding hydration
// mismatches that would otherwise force React to re-render the whole tree.
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
