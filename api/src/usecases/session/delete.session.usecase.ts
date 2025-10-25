// src\usecases\session\delete.session.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { DeleteSessionUsecaseDto } from '@usecases/session/session.usecase.dto';

export class DeleteSessionUsecase {
  constructor(private readonly inversify: Inversify) {}

  /** Soft delete (idempotent): true if newly deleted, false if already deleted or not found. */
  async execute(dto: DeleteSessionUsecaseDto): Promise<boolean> {
    try {
      const { session, id } = dto;
      const existing = await this.inversify.bddService.session.get({ id });
      if (!existing) {
        return false;
      }

      const creatorId =
        typeof existing.createdBy === 'string' ? existing.createdBy : existing.createdBy?.id;
      const isAdmin = session.role === Role.ADMIN;
      const isCreator = creatorId === session.userId;

      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.DELETE_SESSION_FORBIDDEN);
      }

      return await this.inversify.bddService.session.delete(id);
    } catch (e: any) {
      if (e?.message === ERRORS.DELETE_SESSION_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`DeleteSessionUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.DELETE_SESSION_USECASE);
    }
  }
}
