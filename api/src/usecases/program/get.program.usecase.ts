// src\\usecases\\program\\get.program.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { GetProgramUsecaseDto } from '@usecases/program/program.usecase.dto';
import { mapProgramToUsecase } from '@usecases/program/program.mapper';
import type { ProgramUsecaseModel } from '@usecases/program/program.usecase.model';

export class GetProgramUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: GetProgramUsecaseDto): Promise<ProgramUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const program = await this.inversify.bddService.program.get(payload);
      if (!program) {
        return null;
      }

      const creatorId =
        typeof program.createdBy === 'string' ? program.createdBy : program.createdBy?.id;
      const isAdmin = session.role === 'ADMIN';
      const isCreator = creatorId === session.userId;

      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.GET_PROGRAM_FORBIDDEN);
      }

      return mapProgramToUsecase(program);
    } catch (e: any) {
      if (e?.message === ERRORS.GET_PROGRAM_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`GetProgramUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.GET_PROGRAM_USECASE);
    }
  }
}
