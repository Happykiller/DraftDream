// src/common/enum.util.ts
// Minimal enum utilities to keep values consistent across layers.

import { ProspectStatus } from './prospect-status.enum';
import { Role } from './role.enum';
import { Visibility } from './visibility.enum';

/**
 * Converts an input value to its uppercase enum representation.
 */
export function toVisibility(value?: Visibility | string | null): Visibility | undefined {
  if (!value) return undefined;
  return value.toString().toUpperCase().trim() as Visibility;
}

/**
 * Converts an input value to its uppercase role representation.
 */
export function toRole(value?: Role | string | null): Role | undefined {
  if (!value) return undefined;
  return value.toString().toUpperCase().trim() as Role;
}

/**
 * Converts an input value to its uppercase prospect status representation.
 */
export function toProspectStatus(value?: ProspectStatus | string | null): ProspectStatus | undefined {
  if (!value) return undefined;
  return value.toString().toUpperCase().trim() as ProspectStatus;
}

/**
 * Case-insensitive equality check between two enum-compatible values.
 */
export function enumEquals(value1: string | undefined | null, value2: string | undefined | null): boolean {
  if (!value1 || !value2) {
    return value1 === value2;
  }

  return value1.toUpperCase().trim() === value2.toUpperCase().trim();
}
