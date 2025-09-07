// src\common\logger.ts
import 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';

/* istanbul ignore next */
const myFormat = format.printf((info) => {
  let myformat: string;
  if (info.error) {
    myformat = `${info.timestamp} ${info.module} ${info.level}: ${info.message} => ${info.error}`;
  } else {
    myformat = `${info.timestamp} ${info.module} ${info.level}: ${info.message}`;
  }
  return myformat;
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
