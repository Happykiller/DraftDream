// src\services\logger\logger.service.fake.ts
/* istanbul ignore file */
import { LoggerService } from './logger.service';

export class LoggerServiceFake implements LoggerService {
  log(...args: any[]): void {
    console.log(this.formatArgs(args));
  }

  info(...args: any[]): void {
    console.info(this.formatArgs(args));
  }

  debug(...args: any[]): void {
    console.debug(this.formatArgs(args));
  }

  error(...args: any[]): void {
    console.error(this.formatArgs(args));
  }

  private formatArgs(args: any[]): string {
    return args
      .map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg))
      .join(' ');
  }
}
