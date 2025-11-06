// src/common/__tests__/error.util.spec.ts
import { ERRORS } from '@src/common/ERROR';
import { describe, expect, it } from '@jest/globals';
import { normalizeError } from '@src/common/error.util';

describe('normalizeError', () => {
  it('returns the provided error when the message matches a known error code', () => {
    const error = new Error(ERRORS.UPDATE_EXERCISE_FORBIDDEN);

    const result = normalizeError(error, ERRORS.UPDATE_EXERCISE_USECASE);

    expect(result).toBe(error);
  });

  it('returns a fallback error when the message is not a known error code', () => {
    const error = new Error('Unexpected error');

    const result = normalizeError(error, ERRORS.UPDATE_EXERCISE_USECASE);

    expect(result).not.toBe(error);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe(ERRORS.UPDATE_EXERCISE_USECASE);
  });

  it('wraps non-error values using the fallback error code', () => {
    const result = normalizeError('failure', ERRORS.UPDATE_EXERCISE_USECASE);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe(ERRORS.UPDATE_EXERCISE_USECASE);
  });
});
