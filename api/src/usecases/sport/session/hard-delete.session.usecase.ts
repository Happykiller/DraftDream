import { UnauthorizedException } from '@nestjs/common';

import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

interface DeleteSessionUsecaseDto {
  id: string;
  session: {
    userId: string;
    role: Role;
  };
}

/**
 * Hard deletes a session.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteSessionUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteSessionUsecaseDto): Promise<boolean> {
    try {
      const { id, session } = dto;
      const entity = await this.inversify.bddService.session.get({ id });

      if (!entity) {
        if (session.role === Role.ADMIN) return false;
        throw new Error('SESSION_NOT_FOUND');
      }

      if (session.role !== Role.ADMIN && entity.createdBy !== session.userId) {
        throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_SESSION');
      }

      return await this.inversify.bddService.session.hardDelete(id);
    } catch (error: any) {
      if (error instanceof UnauthorizedException || error?.message === 'SESSION_NOT_FOUND') {
        throw error;
      }

      this.inversify.loggerService.error(`HardDeleteSessionUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.HARD_DELETE_SESSION_USECASE);
    }
  }
}
