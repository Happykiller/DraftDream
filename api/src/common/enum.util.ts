// src/common/enum.util.ts
// Utility functions for case-insensitive enum handling to prevent case-sensitivity issues

import { Visibility } from './visibility.enum';
import { Role } from './role.enum';
import { ProspectStatus } from './prospect-status.enum';

/**
 * Generic enum normalizer that converts a string value to the matching enum value.
 * Performs case-insensitive matching.
 * 
 * @param value - The string value to normalize
 * @param enumObj - The enum object to match against
 * @returns The matching enum value or undefined if no match found
 */
export function normalizeEnum<T extends Record<string, string>>(
    value: string | undefined | null,
    enumObj: T,
): T[keyof T] | undefined {
    if (!value) {
        return undefined;
    }

    const upperValue = value.toUpperCase().trim();
    const enumValues = Object.values(enumObj);

    for (const enumValue of enumValues) {
        if (enumValue.toUpperCase() === upperValue) {
            return enumValue as T[keyof T];
        }
    }

    return undefined;
}

/**
 * Normalizes visibility enum values to uppercase.
 * Accepts 'public', 'PUBLIC', 'private', 'PRIVATE' and returns the proper enum value.
 * 
 * @param value - The visibility value to normalize
 * @returns Normalized visibility value or undefined
 */
export function normalizeVisibility(
    value: string | undefined | null,
): 'PRIVATE' | 'PUBLIC' | undefined {
    return normalizeEnum(value, Visibility) as 'PRIVATE' | 'PUBLIC' | undefined;
}

/**
 * Normalizes role enum values to uppercase.
 * Accepts 'admin', 'ADMIN', 'coach', 'COACH', etc. and returns the proper enum value.
 * 
 * @param value - The role value to normalize
 * @returns Normalized role value or undefined
 */
export function normalizeRole(
    value: string | undefined | null,
): 'ADMIN' | 'COACH' | 'ATHLETE' | undefined {
    return normalizeEnum(value, Role) as 'ADMIN' | 'COACH' | 'ATHLETE' | undefined;
}

/**
 * Normalizes prospect status enum values to uppercase.
 * 
 * @param value - The prospect status value to normalize
 * @returns Normalized prospect status value or undefined
 */
export function normalizeProspectStatus(
    value: string | undefined | null,
): ProspectStatus | undefined {
    return normalizeEnum(value, ProspectStatus) as ProspectStatus | undefined;
}

/**
 * Compares two enum values in a case-insensitive manner.
 * 
 * @param value1 - First value to compare
 * @param value2 - Second value to compare
 * @returns True if values match (case-insensitive), false otherwise
 */
export function enumEquals(
    value1: string | undefined | null,
    value2: string | undefined | null,
): boolean {
    if (!value1 || !value2) {
        return value1 === value2;
    }

    return value1.toUpperCase().trim() === value2.toUpperCase().trim();
}
