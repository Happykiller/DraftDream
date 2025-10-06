// src\usecases\session\create.session.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { CreateSessionUsecaseDto } from '@usecases/session/session.usecase.dto';
import { mapSessionToUsecase } from '@usecases/session/session.mapper';
import type { SessionUsecaseModel } from '@usecases/session/session.usecase.model';

export class CreateSessionUsecase {
  constructor(private readonly inversify: Inversify) {}

  /** Creates a new session; returns null on slug/locale conflict. */
  async execute(dto: CreateSessionUsecaseDto): Promise<SessionUsecaseModel | null> {
    try {
      const created = await this.inversify.bddService.session.create(dto);
      return created ? mapSessionToUsecase(created) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateSessionUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.CREATE_SESSION_USECASE);
    }
  }
}
