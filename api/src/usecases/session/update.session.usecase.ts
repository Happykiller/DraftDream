// src\usecases\session\update.session.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { UpdateSessionUsecaseDto } from '@usecases/session/session.usecase.dto';
import { mapSessionToUsecase } from '@usecases/session/session.mapper';
import type { SessionUsecaseModel } from '@usecases/session/session.usecase.model';

export class UpdateSessionUsecase {
  constructor(private readonly inversify: Inversify) {}

  /** Partial update; returns null on unique conflict or not found. */
  async execute(id: string, dto: UpdateSessionUsecaseDto): Promise<SessionUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.session.update(id, dto);
      return updated ? mapSessionToUsecase(updated) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateSessionUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.UPDATE_SESSION_USECASE);
    }
  }
}
