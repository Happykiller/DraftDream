import { UnauthorizedException } from '@nestjs/common';

import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

interface DeleteCategoryUsecaseDto {
  id: string;
  session: {
    userId: string;
    role: Role;
  };
}

/**
 * Hard deletes a category.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteCategoryUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteCategoryUsecaseDto): Promise<boolean> {
    try {
      const { id, session } = dto;
      const entity = await this.inversify.bddService.category.get({ id });

      if (!entity) {
        if (session.role === Role.ADMIN) return false;
        throw new Error('CATEGORY_NOT_FOUND');
      }

      if (session.role !== Role.ADMIN && entity.createdBy !== session.userId) {
        throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_CATEGORY');
      }

      return await this.inversify.bddService.category.hardDelete(id);
    } catch (error: any) {
      if (error instanceof UnauthorizedException || error?.message === 'CATEGORY_NOT_FOUND') {
        throw error;
      }

      this.inversify.loggerService.error(`HardDeleteCategoryUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.HARD_DELETE_CATEGORY_USECASE);
    }
  }
}
