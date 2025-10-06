// src\usecases\session\delete.session.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { DeleteSessionUsecaseDto } from '@usecases/session/session.usecase.dto';

export class DeleteSessionUsecase {
  constructor(private readonly inversify: Inversify) {}

  /** Soft delete (idempotent): true if newly deleted, false if already deleted or not found. */
  async execute(dto: DeleteSessionUsecaseDto): Promise<boolean> {
    try {
      return await this.inversify.bddService.session.delete(dto.id);
    } catch (e: any) {
      this.inversify.loggerService.error(`DeleteSessionUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.DELETE_SESSION_USECASE);
    }
  }
}
