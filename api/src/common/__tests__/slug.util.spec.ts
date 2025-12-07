// src\common\__tests__\slug.util.spec.ts
import { randomBytes } from 'crypto';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { buildSlug, slugifyCandidate } from '../slug.util';

jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => Buffer.from('1a2b3c', 'hex')),
}));

describe('slugifyCandidate', () => {
  it('should slugify a simple string', () => {
    expect(slugifyCandidate('Hello World')).toBe('hello-world');
  });

  it('should handle accents and special characters', () => {
    expect(slugifyCandidate('Héllö Wörld! Célébrate.')).toBe('hello-world-celebrate');
  });

  it('should remove leading/trailing spaces and hyphens', () => {
    expect(slugifyCandidate('  -  Another Test -  ')).toBe('another-test');
  });

  it('should handle multiple spaces and special characters', () => {
    expect(slugifyCandidate('  Test   String!!!  With @#$%  Symbols  ')).toBe('test-string-with-symbols');
  });

  it('should return an empty string for null or undefined input', () => {
    expect(slugifyCandidate(null)).toBe('');
    expect(slugifyCandidate(undefined)).toBe('');
  });

  it('should return an empty string for empty input', () => {
    expect(slugifyCandidate('')).toBe('');
  });

  it('should trim to MAX_LENGTH (60 characters)', () => {
    const longString = 'a'.repeat(100);
    expect(slugifyCandidate(longString).length).toBe(60);
    expect(slugifyCandidate(longString)).toBe('a'.repeat(60));
  });

  it('should handle numbers', () => {
    expect(slugifyCandidate('Item 123')).toBe('item-123');
  });

  it('should respect locale-specific lowercasing when provided', () => {
    expect(slugifyCandidate('IĞDIR', 'tr')).toBe('gd-r');
    expect(slugifyCandidate('IĞDIR', 'en-US')).toBe('igdir');
  });

  it('should fallback gracefully when locale is invalid', () => {
    expect(slugifyCandidate('Hello', 'invalid-locale')).toBe('hello');
  });
});

describe('buildSlug', () => {
  const mockRandomBytes = randomBytes as jest.Mock;

  beforeEach(() => {
    mockRandomBytes.mockClear();
    // Reset mock implementation for each test to ensure isolation
    mockRandomBytes.mockImplementation(() => Buffer.from('1a2b3c', 'hex'));
  });

  it('should return the provided slug if it is valid', () => {
    expect(buildSlug({ slug: 'valid-slug', label: 'Some Label' })).toBe('valid-slug');
    expect(mockRandomBytes).not.toHaveBeenCalled();
  });

  it('should generate a slug from the label if no slug is provided', () => {
    expect(buildSlug({ label: 'My Product' })).toBe('my-product-1a2b3c');
    expect(mockRandomBytes).toHaveBeenCalledTimes(1);
  });

  it('should generate a slug from the label with special characters', () => {
    expect(buildSlug({ label: 'My Prödüct!' })).toBe('my-product-1a2b3c');
    expect(mockRandomBytes).toHaveBeenCalledTimes(1);
  });

  it('should use the fallback prefix if both slug and label are empty', () => {
    expect(buildSlug({ fallback: 'default-item' })).toBe('default-item-1a2b3c');
    expect(mockRandomBytes).toHaveBeenCalledTimes(1);
  });

  it('should use DEFAULT_FALLBACK_PREFIX if no slug, label, or fallback is provided', () => {
    expect(buildSlug({})).toBe('item-1a2b3c');
    expect(mockRandomBytes).toHaveBeenCalledTimes(1);
  });

  it('should handle empty string for label and use fallback', () => {
    expect(buildSlug({ label: '', fallback: 'empty-label' })).toBe('empty-label-1a2b3c');
  });

  it('should handle null slug and generate from label', () => {
    expect(buildSlug({ slug: null, label: 'Another Item' })).toBe('another-item-1a2b3c');
  });

  it('should append a random suffix to avoid collisions when generating from label', () => {
    mockRandomBytes.mockImplementationOnce(() => Buffer.from('abc123', 'hex'));
    expect(buildSlug({ label: 'test' })).toBe('test-abc123');
    mockRandomBytes.mockImplementationOnce(() => Buffer.from('def456', 'hex'));
    expect(buildSlug({ label: 'test' })).toBe('test-def456');
    // Ensure it was called twice for these two distinct calls in the test case
    expect(mockRandomBytes).toHaveBeenCalledTimes(2);
  });

  it('should handle label that results in an empty slugified string and use fallback', () => {
    expect(buildSlug({ label: '!@#$%^', fallback: 'invalid-label' })).toBe('invalid-label-1a2b3c');
  });

  it('should use fallback when provided slug is not valid after slugification', () => {
    expect(buildSlug({ slug: '   ', label: 'Valid Label', fallback: 'fallback-value' })).toBe('valid-label-1a2b3c');
  });
});
