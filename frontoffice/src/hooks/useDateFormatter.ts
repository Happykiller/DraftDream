// src/hooks/useDateFormatter.ts
// ⚠️ Comment in English: Reusable date formatter hook + pure utility.
// Provides a stable formatter function using Intl.DateTimeFormat.

import * as React from 'react';

export type DateInput = Date | number | string | null | undefined;

export interface UseDateFormatterParams {
  locale?: string; // e.g., 'fr', 'en-US'. If omitted, use browser default.
  options?: Intl.DateTimeFormatOptions; // customize formatting if needed
}

/** Pure helper (non-React) for ad-hoc formatting */
export function formatDate(
  value: DateInput,
  locale?: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'short', timeStyle: 'short' }
): string {
  if (value == null) return '—';
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return '—';
  const fmt = new Intl.DateTimeFormat(locale, options);
  return fmt.format(d);
}

/** React hook: returns a stable formatter function for performance */
export function useDateFormatter({
  locale,
  options = { dateStyle: 'short', timeStyle: 'short' },
}: UseDateFormatterParams = {}) {
  const fmt = React.useMemo(() => new Intl.DateTimeFormat(locale, options), [locale, options]);

  // Return a memoized fn so components can pass directly to valueFormatter
  // without causing re-renders on each render pass.
  const format = React.useCallback(
    (value: DateInput): string => {
      if (value == null) return '—';
      const d = value instanceof Date ? value : new Date(String(value));
      return Number.isNaN(d.getTime()) ? '—' : fmt.format(d);
    },
    [fmt]
  );

  return format;
}
