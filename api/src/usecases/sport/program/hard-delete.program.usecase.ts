import { UnauthorizedException } from '@nestjs/common';

import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

interface DeleteProgramUsecaseDto {
  id: string;
  session: {
    userId: string;
    role: Role;
  };
}

/**
 * Hard deletes a program.
 * Allowed for ADMIN or the entity owner (createdBy/userId).
 */
export class HardDeleteProgramUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteProgramUsecaseDto): Promise<boolean> {
    try {
      const { id, session } = dto;
      const entity = await this.inversify.bddService.program.get({ id });

      if (!entity) {
        if (session.role === Role.ADMIN) return false;
        throw new Error('PROGRAM_NOT_FOUND');
      }

      if (session.role !== Role.ADMIN && entity.createdBy !== session.userId && entity.userId !== session.userId) {
        throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_PROGRAM');
      }

      return await this.inversify.bddService.program.hardDelete(id);
    } catch (error: any) {
      if (error instanceof UnauthorizedException || error?.message === 'PROGRAM_NOT_FOUND') {
        throw error;
      }

      this.inversify.loggerService.error(`HardDeleteProgramUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.HARD_DELETE_PROGRAM_USECASE);
    }
  }
}
