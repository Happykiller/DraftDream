// src\\usecases\\program\\get.program.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { GetProgramUsecaseDto } from '@src/usecases/sport/program/program.usecase.dto';
import { mapProgramToUsecase } from '@src/usecases/sport/program/program.mapper';
import type { ProgramUsecaseModel } from '@src/usecases/sport/program/program.usecase.model';

export class GetProgramUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetProgramUsecaseDto): Promise<ProgramUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const program = await this.inversify.bddService.program.get(payload);
      if (!program) {
        return null;
      }

      const creatorId =
        typeof program.createdBy === 'string' ? program.createdBy : program.createdBy?.id;
      const assigneeId = typeof program.userId === 'string' ? program.userId : undefined;
      const isAdmin = session.role === Role.ADMIN;
      const isCreator = creatorId === session.userId;
      const isCoach = session.role === Role.COACH;
      let isPublic = false;
      if (isCoach) {
        const creatorIsAdmin = await this.isPublicProgram(creatorId);
        isPublic = program.visibility === 'public' || program.visibility === 'hybrid' || creatorIsAdmin;
      }
      const isAssignedAthlete = session.role === Role.ATHLETE && assigneeId === session.userId;

      if (!isAdmin && !isCreator && !(isCoach && isPublic) && !isAssignedAthlete) {
        throw new Error(ERRORS.GET_PROGRAM_FORBIDDEN);
      }

      return mapProgramToUsecase(program);
    } catch (e: any) {
      if (e?.message === ERRORS.GET_PROGRAM_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`GetProgramUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.GET_PROGRAM_USECASE);
    }
  }

  private async isPublicProgram(creatorId?: string | null): Promise<boolean> {
    if (!creatorId) {
      return false;
    }

    try {
      const user = await this.inversify.bddService.user.getUser({ id: creatorId });
      return user?.type === 'admin';
    } catch (error) {
      this.inversify.loggerService.warn?.(
        `GetProgramUsecase#isPublicProgram => ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
}
