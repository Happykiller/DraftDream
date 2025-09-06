// src\services\logger\logger.service.ts
export interface LoggerService {
  log(msg: string): void;
  info(msg: string): void;
  error(msg: string): void;
}
