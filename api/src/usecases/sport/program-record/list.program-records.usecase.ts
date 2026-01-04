// src/usecases/sport/program-record/list.program-records.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapProgramRecordToUsecase } from '@src/usecases/sport/program-record/program-record.mapper';

import { ListProgramRecordsUsecaseDto } from './program-record.usecase.dto';
import { ProgramRecordUsecaseModel } from './program-record.usecase.model';

interface ListProgramRecordsResult {
  items: ProgramRecordUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Lists program records with session-based filtering.
 */
export class ListProgramRecordsUsecase {
  constructor(private readonly inversify: Inversify) { }

  /**
   * Applies ownership constraints and returns paginated results.
   */
  async execute(dto: ListProgramRecordsUsecaseDto): Promise<ListProgramRecordsResult> {
    try {
      const { session, ...filters } = dto;
      const isAdmin = session.role === Role.ADMIN;
      const isCoach = session.role === Role.COACH;

      const result = await this.inversify.bddService.programRecord.list({
        userId: isAdmin ? filters.userId : (isCoach ? filters.userId ?? session.userId : session.userId),
        programId: filters.programId,
        sessionId: filters.sessionId,
        state: filters.state,
        includeArchived: isAdmin ? filters.includeArchived : false,
        limit: filters.limit,
        page: filters.page,
      });

      return {
        items: result.items.map(mapProgramRecordToUsecase),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListProgramRecordsUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.LIST_PROGRAM_RECORDS_USECASE);
    }
  }
}
