// src\usecases\default\test.db.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';

export class DbTestUsecase {
  inversify: Inversify;

  constructor(inversify: Inversify) {
    this.inversify = inversify;
  }

  async execute(): Promise<boolean> {
    try {
      return await this.inversify.bddService.test.test();
    } catch (e: any) {
      this.inversify.loggerService.error(`DbTestUsecase#execute=>${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.DB_TEST_USECASE);
    }
  }
}
