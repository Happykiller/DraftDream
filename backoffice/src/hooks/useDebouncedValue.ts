// src/hooks/useDebouncedValue.ts
// ⚠️ Comment in English: Returns a debounced value that updates after `delay` ms without changes.
import * as React from 'react';

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
