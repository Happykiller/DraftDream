import { UnauthorizedException } from '@nestjs/common';

import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';

interface DeleteExerciseUsecaseDto {
  id: string;
  session: {
    userId: string;
    role: Role;
  };
}

/**
 * Hard deletes an exercise.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteExerciseUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteExerciseUsecaseDto): Promise<boolean> {
    try {
      const { id, session } = dto;
      const entity = await this.inversify.bddService.exercise.get({ id });

      if (!entity) {
        if (session.role === Role.ADMIN) return false;
        throw new Error('EXERCISE_NOT_FOUND');
      }

      if (session.role !== Role.ADMIN && entity.createdBy !== session.userId) {
        throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_EXERCISE');
      }

      return await this.inversify.bddService.exercise.hardDelete(id);
    } catch (error: any) {
      if (error instanceof UnauthorizedException || error?.message === 'EXERCISE_NOT_FOUND') {
        throw error;
      }

      this.inversify.loggerService.error(`HardDeleteExerciseUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.HARD_DELETE_EXERCISE_USECASE);
    }
  }
}
