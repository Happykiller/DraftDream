// src/usecases/sport/program-record/create.program-record.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { ProgramRecordState } from '@src/common/program-record-state.enum';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapProgramRecordToUsecase } from '@src/usecases/sport/program-record/program-record.mapper';
import { ProgramUsecaseModel } from '@src/usecases/sport/program/program.usecase.model';
import type { ProgramRecordSessionSnapshotUsecaseModel } from '@src/usecases/sport/program-record/program-record.usecase.model';

import {
  CreateProgramRecordUsecaseDto,
  UsecaseSession,
} from './program-record.usecase.dto';
import { ProgramRecordUsecaseModel } from './program-record.usecase.model';

/**
 * Starts a program record for an athlete.
 */
export class CreateProgramRecordUsecase {
  constructor(private readonly inversify: Inversify) { }

  /**
   * Creates a program record or returns the existing one for the same user/program.
   */
  async execute(dto: CreateProgramRecordUsecaseDto): Promise<ProgramRecordUsecaseModel | null> {
    try {
      const userId = dto.userId ?? dto.session.userId;
      this.assertCreationRights(dto.session, userId);

      const program = await this.ensureProgramAccessible(dto.session, dto.programId, userId);
      if (!program) {
        return null;
      }



      const sessionSnapshot = this.getSessionSnapshot(program, dto.sessionId);
      if (!sessionSnapshot) {
        return null;
      }

      const created = await this.inversify.bddService.programRecord.create({
        userId,
        programId: dto.programId,
        sessionId: dto.sessionId,
        sessionSnapshot,
        recordData: dto.recordData,
        comment: dto.comment,
        satisfactionRating: dto.satisfactionRating,
        durationMinutes: dto.durationMinutes,
        difficultyRating: dto.difficultyRating,
        state: dto.state ?? ProgramRecordState.CREATE,
        createdBy: dto.session.userId,
      });


      return created ? mapProgramRecordToUsecase(created) : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateProgramRecordUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.CREATE_PROGRAM_RECORD_USECASE);
    }
  }

  private assertCreationRights(session: UsecaseSession, targetUserId: string): void {
    const isAdmin = session.role === Role.ADMIN;
    const isSelf = session.userId === targetUserId;
    if (!isAdmin && session.role === Role.ATHLETE && !isSelf) {
      throw new Error(ERRORS.FORBIDDEN);
    }
  }

  private async ensureProgramAccessible(
    session: UsecaseSession,
    programId: string,
    targetUserId: string,
  ): Promise<ProgramUsecaseModel | null> {
    const program = await this.inversify.getProgramUsecase.execute({ id: programId, session });
    if (!program) {
      return null;
    }

    if (session.role === Role.ADMIN) {
      return program;
    }

    if (!program.userId) {
      if (session.role === Role.ATHLETE) {
        throw new Error(ERRORS.FORBIDDEN);
      }
      return program;
    }

    if (program.userId !== targetUserId) {
      throw new Error(ERRORS.FORBIDDEN);
    }

    return program;
  }

  private getSessionSnapshot(
    program: ProgramUsecaseModel,
    sessionId: string,
  ): ProgramRecordSessionSnapshotUsecaseModel | null {
    const session = program.sessions.find(
      (candidate) => candidate.id === sessionId || candidate.templateSessionId === sessionId,
    );
    if (!session) {
      return null;
    }

    return {
      ...session,
      exercises: session.exercises.map((exercise) => ({ ...exercise })),
    };
  }
}
