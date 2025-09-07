// src\graphql\common\nestLogger.ts
import { LoggerService } from '@nestjs/common';

import { logger } from '@src/common/logger';

export class NestLogger implements LoggerService {
  log(message: string): void {
    logger.info(message, {
      module: 'nestjs',
    });
  }
  /* eslint-disable @typescript-eslint/no-unused-vars */
  error(message: string, trace: string): void {
    // Handle by nestFormatterError in app module
  }
  warn(message: string): void {
    logger.warn(message, {
      module: 'nestjs',
    });
  }
  debug(message: string): void {
    logger.debug(message, {
      module: 'nestjs',
    });
  }
  verbose(message: string): void {
    logger.verbose(message, {
      module: 'nestjs',
    });
  }
}
