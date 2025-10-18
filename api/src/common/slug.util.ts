// src\\common\\slug.util.ts
import { randomBytes } from 'crypto';

const DEFAULT_FALLBACK_PREFIX = 'item';
const MAX_LENGTH = 60;

/**
 * Normalize a slug candidate by removing accents, non-alphanumeric characters and trimming length.
 * Returns an empty string when the input cannot produce a valid slug.
 */
export function slugifyCandidate(input?: string | null): string {
  const base = (input ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, MAX_LENGTH)
    .trim();

  return base;
}

const randomSlugSuffix = (): string => randomBytes(3).toString('hex');

/**
 * Build a usable slug. Reuses the provided slug when valid, otherwise generates one from the label
 * and appends a random suffix to reduce collision risks. Falls back to the provided prefix when
 * both slug and label are empty.
 */
export function buildSlug({
  slug,
  label,
  fallback,
}: {
  slug?: string | null;
  label?: string | null;
  fallback?: string;
}): string {
  const candidate = slugifyCandidate(slug);
  if (candidate) return candidate;

  const base = slugifyCandidate(label) || fallback || DEFAULT_FALLBACK_PREFIX;
  return `${base}-${randomSlugSuffix()}`;
}
