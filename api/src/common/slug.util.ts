// src\\common\\slug.util.ts
import { randomBytes } from 'crypto';

const DEFAULT_FALLBACK_PREFIX = 'item';
const MAX_LENGTH = 60;

/**
 * Normalize a slug candidate by removing accents, non-alphanumeric characters and trimming length.
 * When provided, the locale guides the lowercasing step to honor language-specific casing rules.
 * Returns an empty string when the input cannot produce a valid slug.
 */
export function slugifyCandidate(input?: string | null, locale?: string): string {
  const normalizedInput = input ?? '';

  let lowerCased = normalizedInput;
  try {
    lowerCased = normalizedInput.toLocaleLowerCase(locale);
  } catch {
    lowerCased = normalizedInput.toLowerCase();
  }

  const base = lowerCased
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
 * both slug and label are empty. Locale is optional and should be forwarded when entities carry it
 * to keep casing aligned with the content language.
 */
export function buildSlug({
  slug,
  label,
  fallback,
  locale,
}: {
  slug?: string | null;
  label?: string | null;
  fallback?: string;
  locale?: string;
}): string {
  const candidate = slugifyCandidate(slug, locale);
  if (candidate) return candidate;

  const labelSlug = slugifyCandidate(label, locale);
  if (labelSlug) {
    return `${labelSlug}-${randomSlugSuffix()}`;
  }

  const fallbackBase = fallback?.trim();
  const base = fallbackBase && fallbackBase.length > 0 ? fallbackBase : DEFAULT_FALLBACK_PREFIX;
  return `${base}-${randomSlugSuffix()}`;
}
