// src\usecases\session\get.session.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { GetSessionUsecaseDto } from '@usecases/session/session.usecase.dto';
import { mapSessionToUsecase } from '@usecases/session/session.mapper';
import type { SessionUsecaseModel } from '@usecases/session/session.usecase.model';

export class GetSessionUsecase {
  constructor(private readonly inversify: Inversify) {}

  /** Returns a session or null (invalid id or not found). */
  async execute(dto: GetSessionUsecaseDto): Promise<SessionUsecaseModel | null> {
    try {
      const s = await this.inversify.bddService.session.get(dto);
      return s ? mapSessionToUsecase(s) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`GetSessionUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.GET_SESSION_USECASE);
    }
  }
}
