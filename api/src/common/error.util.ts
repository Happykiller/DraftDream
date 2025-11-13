// src/common/error.util.ts
import { ERRORS } from '@src/common/ERROR';

const ERROR_MESSAGES = new Set<string>(Object.values(ERRORS));

/**
 * Normalize an incoming error to keep existing error codes or fallback to a default error code.
 */
export const normalizeError = (error: unknown, fallback: ERRORS): Error => {
  if (error instanceof Error && ERROR_MESSAGES.has(error.message)) {
    return error;
  }

  return new Error(fallback);
};
