// src\common\logger.ts
import 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';
import { inspect } from 'util';
import type { TransformableInfo } from 'logform';

type LoggerInfo = TransformableInfo & {
  timestamp?: string;
  module?: string;
  level: string;
  message: string;
  error?: unknown;
};

const toLogString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value instanceof Error) {
    return value.stack ?? value.message;
  }
  if (value === undefined || value === null) {
    return '';
  }
  try {
    return JSON.stringify(value);
  } catch {
    return inspect(value, { depth: 3, breakLength: 80 });
  }
};

/* istanbul ignore next */
const myFormat = format.printf((info: LoggerInfo) => {
  const timestamp = toLogString(info.timestamp);
  const moduleName = toLogString(info.module);
  const level = toLogString(info.level);
  const message = toLogString(info.message);
  const prefix = [timestamp, moduleName, level].filter(Boolean).join(' ').trim();
  const base = prefix ? `${prefix}: ${message}` : message;
  if (info.error) {
    const errorDetails = toLogString(info.error);
    return `${base} => ${errorDetails}`;
  }
  return base;
});

// Default
const logger = createLogger({
  level: 'error',
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.json(),
  ),
  defaultMeta: { module: 'apis' },
  transports: [new transports.Console()],
});

/* istanbul ignore next */
if (process.env.NODE_ENV === 'prod') {
  logger.level = 'debug';

  const transport = new transports.DailyRotateFile({
    level: 'info',
    filename: 'logs/apis-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
  });

  logger.add(transport);
} else {
  logger.level = 'debug';
  logger.transports[0].format = format.combine(
    format.errors({ stack: true }),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.colorize(),
    myFormat,
  );
}

export { logger };
