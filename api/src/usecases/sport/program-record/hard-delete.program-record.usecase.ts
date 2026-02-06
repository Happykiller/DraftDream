import { UnauthorizedException } from '@nestjs/common';

import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

import { DeleteProgramRecordUsecaseDto } from './program-record.usecase.dto';

/**
 * Hard deletes a program record.
 * Allowed for ADMIN or the record owner.
 */
export class HardDeleteProgramRecordUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteProgramRecordUsecaseDto): Promise<boolean> {
    try {
      const { id, session } = dto;
      const record = await this.inversify.bddService.programRecord.get({ id });

      if (!record) {
        if (session.role === Role.ADMIN) return false;
        throw new Error('PROGRAM_RECORD_NOT_FOUND');
      }

      if (session.role !== Role.ADMIN && record.userId !== session.userId && record.createdBy !== session.userId) {
        throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_PROGRAM_RECORD');
      }

      return await this.inversify.bddService.programRecord.hardDelete(id);
    } catch (error: any) {
      if (error instanceof UnauthorizedException || error?.message === 'PROGRAM_RECORD_NOT_FOUND') {
        throw error;
      }

      this.inversify.loggerService.error(`HardDeleteProgramRecordUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.HARD_DELETE_PROGRAM_RECORD_USECASE);
    }
  }
}
