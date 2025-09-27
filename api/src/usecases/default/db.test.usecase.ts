// src\usecases\default\test.db.usecase.ts
import { Inversify } from '@src/inversify/investify';

export class DbTestUsecase {
  inversify: Inversify;

  constructor(inversify: Inversify) {
    this.inversify = inversify;
  }

  async execute(): Promise<boolean> {
    return await this.inversify.bddService.test.test();
  }
}
