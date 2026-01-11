// src/usecases/sport/program-record/get.program-record.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapProgramRecordToUsecase } from '@src/usecases/sport/program-record/program-record.mapper';

import { GetProgramRecordUsecaseDto } from './program-record.usecase.dto';
import { ProgramRecordUsecaseModel } from './program-record.usecase.model';

/**
 * Retrieves a program record while enforcing ownership rules.
 */
export class GetProgramRecordUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Returns the record if the requester has access.
   */
  async execute(dto: GetProgramRecordUsecaseDto): Promise<ProgramRecordUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const record = await this.inversify.bddService.programRecord.get(payload);
      if (!record) {
        return null;
      }

      const isAdmin = session.role === Role.ADMIN;
      const isCoach = session.role === Role.COACH;
      const isOwner = record.userId === session.userId;
      if (!isAdmin && !isCoach && !isOwner) {
        throw new Error(ERRORS.FORBIDDEN);
      }

      return mapProgramRecordToUsecase(record);
    } catch (error: any) {
      this.inversify.loggerService.error(
        `GetProgramRecordUsecase#execute (recordId: ${dto.id}) => ${error?.message ?? error}`,
      );
      throw normalizeError(error, ERRORS.GET_PROGRAM_RECORD_USECASE);
    }
  }
}
