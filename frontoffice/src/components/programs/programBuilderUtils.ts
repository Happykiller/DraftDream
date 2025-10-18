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
