import * as React from 'react';

/** Formats phone numbers into spaced pairs for readability (e.g., 0000000000 -> 00 00 00 00 00). */
export function usePhoneFormatter(): (value: string | null | undefined) => string {
  return React.useCallback((value: string | null | undefined) => {
    if (!value) {
      return '';
    }

    const digits = value.replace(/\D/g, '');
    if (!digits) {
      return value;
    }

    const pairs = digits.match(/.{1,2}/g);
    return pairs ? pairs.join(' ') : value;
  }, []);
}
