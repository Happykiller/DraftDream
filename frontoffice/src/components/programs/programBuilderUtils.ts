import * as React from 'react';

import type { DragPayload } from './programBuilderTypes';

type LogLevel = 'log' | 'warn';

export const logWithTimestamp = (
  level: LogLevel,
  message: string,
  payload?: unknown,
): void => {
  const timestamp = new Date().toISOString();
  if (typeof payload === 'undefined') {
    console[level](`${timestamp} ${message}`);
  } else {
    console[level](`${timestamp} ${message}`, payload);
  }
};

/**
 * Serialises the drag payload before delegating the DOM drag start event.
 */
export const beginDrag = <T extends HTMLElement>(
  event: React.DragEvent<T>,
  payload: DragPayload,
): void => {
  // Debug: log the drag payload and originating element.
  logWithTimestamp('log', '[ProgramBuilder][beginDrag] start', {
    payload,
    targetTag: event.currentTarget?.tagName,
    dataTypesBefore: Array.from(event.dataTransfer.types ?? []),
  });

  event.dataTransfer.setData('application/json', JSON.stringify(payload));
  // Add a plain text channel to improve browser support while keeping the same payload.
  event.dataTransfer.setData('text/plain', payload.type);
  event.dataTransfer.effectAllowed = 'copyMove';

  logWithTimestamp('log', '[ProgramBuilder][beginDrag] prepared payload', {
    effectAllowed: event.dataTransfer.effectAllowed,
    dataTypesAfter: Array.from(event.dataTransfer.types ?? []),
  });
};

/**
 * Extracts the payload set with {@link beginDrag}.
 */
export const parseDragData = (
  event: React.DragEvent,
): DragPayload | null => {
  const raw = event.dataTransfer.getData('application/json');
  logWithTimestamp('log', '[ProgramBuilder][parseDragData] raw data', {
    raw,
    availableTypes: Array.from(event.dataTransfer.types ?? []),
  });
  if (!raw) {
    logWithTimestamp('warn', '[ProgramBuilder][parseDragData] Missing application/json payload');
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DragPayload;
    logWithTimestamp('log', '[ProgramBuilder][parseDragData] parsed payload', parsed);
    return parsed;
  } catch (error) {
    logWithTimestamp('warn', '[ProgramBuilder][parseDragData] Unable to parse drag payload', {
      error,
      raw,
    });
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
