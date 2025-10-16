import * as React from 'react';

import type { DragPayload } from './programBuilderTypes';

/**
 * Serialises the drag payload before delegating the DOM drag start event.
 */
export const beginDrag = <T extends HTMLElement>(
  event: React.DragEvent<T>,
  payload: DragPayload,
): void => {
  event.dataTransfer.setData('application/json', JSON.stringify(payload));
  event.dataTransfer.effectAllowed = 'copyMove';
};

/**
 * Extracts the payload set with {@link beginDrag}.
 */
export const parseDragData = (
  event: React.DragEvent,
): DragPayload | null => {
  const raw = event.dataTransfer.getData('application/json');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DragPayload;
  } catch (error) {
    console.warn('Unable to parse drag payload', error);
    return null;
  }
};

/**
 * Converts raw series metadata to a positive integer fallbacking to 3 when ambiguous.
 */
export const parseSeriesCount = (
  series: string | null | undefined,
): number => {
  if (!series) {
    return 3;
  }

  const direct = Number(series);
  if (!Number.isNaN(direct) && direct > 0) {
    return direct;
  }

  const match = series.match(/\d+/);
  return match ? Number(match[0]) : 3;
};

/**
 * Parses rest duration in seconds while ignoring placeholders and blanks.
 */
export const parseRestSecondsValue = (
  rest: string | null | undefined,
): number | undefined => {
  if (!rest) {
    return undefined;
  }

  const trimmed = rest.trim();
  if (!trimmed || trimmed === '-') {
    return undefined;
  }

  const match = trimmed.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : undefined;
};
