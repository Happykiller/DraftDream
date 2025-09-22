// src/layouts/hooks/useMobileDrawer.ts
import * as React from 'react';

/** Manage mobile drawer open/close state with stable callbacks. */
export function useMobileDrawer() {
  const [open, setOpen] = React.useState(false);
  const toggle = React.useCallback(() => setOpen(v => !v), []);
  const close = React.useCallback(() => setOpen(false), []);
  return { open, toggle, close };
}
