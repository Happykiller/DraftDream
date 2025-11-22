// src\\usecases\\program\\delete.program.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { DeleteProgramUsecaseDto } from '@src/usecases/sport/program/program.usecase.dto';

export class DeleteProgramUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteProgramUsecaseDto): Promise<boolean> {
    try {
      const { session, id } = dto;
      const program = await this.inversify.bddService.program.get({ id });
      if (!program) {
        return false;
      }

      const creatorId =
        typeof program.createdBy === 'string' ? program.createdBy : program.createdBy?.id;
      const isAdmin = session.role === Role.ADMIN;
      const isCreator = creatorId === session.userId;

      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.DELETE_PROGRAM_FORBIDDEN);
      }

      return await this.inversify.bddService.program.delete(id);
    } catch (e: any) {
      if (e?.message === ERRORS.DELETE_PROGRAM_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`DeleteProgramUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.DELETE_PROGRAM_USECASE);
    }
  }
}
