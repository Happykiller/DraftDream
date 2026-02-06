import { UnauthorizedException } from '@nestjs/common';

import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

interface DeleteEquipmentUsecaseDto {
  id: string;
  session: {
    userId: string;
    role: Role;
  };
}

/**
 * Hard deletes an equipment.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteEquipmentUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteEquipmentUsecaseDto): Promise<boolean> {
    try {
      const { id, session } = dto;
      const entity = await this.inversify.bddService.equipment.get({ id });

      if (!entity) {
        if (session.role === Role.ADMIN) return false;
        throw new Error('EQUIPMENT_NOT_FOUND');
      }

      if (session.role !== Role.ADMIN && entity.createdBy !== session.userId) {
        throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_EQUIPMENT');
      }

      return await this.inversify.bddService.equipment.hardDelete(id);
    } catch (error: any) {
      if (error instanceof UnauthorizedException || error?.message === 'EQUIPMENT_NOT_FOUND') {
        throw error;
      }

      this.inversify.loggerService.error(`HardDeleteEquipmentUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.HARD_DELETE_EQUIPMENT_USECASE);
    }
  }
}
