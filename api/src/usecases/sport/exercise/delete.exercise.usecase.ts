// src/usecases/exercise/delete.exercise.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { DeleteExerciseUsecaseDto } from '@src/usecases/sport/exercise/exercise.usecase.dto';

export class DeleteExerciseUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: DeleteExerciseUsecaseDto): Promise<boolean> {
    try {
      const { session, id } = dto;
      const exercise = await this.inversify.bddService.exercise.get({ id });
      if (!exercise) {
        return false;
      }

      const creatorId =
        typeof exercise.createdBy === 'string' ? exercise.createdBy : exercise.createdBy?.id;
      const isAdmin = session.role === Role.ADMIN;
      const isCreator = creatorId === session.userId;

      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.DELETE_EXERCISE_FORBIDDEN);
      }

      return await this.inversify.bddService.exercise.delete(id);
    } catch (e: any) {
      if (e?.message === ERRORS.DELETE_EXERCISE_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`DeleteExerciseUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.DELETE_EXERCISE_USECASE);
    }
  }
}
