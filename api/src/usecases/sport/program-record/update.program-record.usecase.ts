// src/usecases/sport/program-record/update.program-record.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapProgramRecordToUsecase } from '@src/usecases/sport/program-record/program-record.mapper';

import { UpdateProgramRecordUsecaseDto } from './program-record.usecase.dto';
import { ProgramRecordUsecaseModel } from './program-record.usecase.model';

/**
 * Updates the state of a program record.
 */
export class UpdateProgramRecordUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Persists state changes when authorized.
   */
  async execute(dto: UpdateProgramRecordUsecaseDto): Promise<ProgramRecordUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const record = await this.inversify.bddService.programRecord.get({ id: payload.id });
      if (!record) {
        return null;
      }

      const isAdmin = session.role === Role.ADMIN;
      const isOwner = record.userId === session.userId;
      if (!isAdmin && !isOwner) {
        return null;
      }

      const updated = await this.inversify.bddService.programRecord.update(payload.id, {
        state: payload.state,
      });

      return updated ? mapProgramRecordToUsecase(updated) : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateProgramRecordUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.UPDATE_PROGRAM_RECORD_USECASE);
    }
  }
}
