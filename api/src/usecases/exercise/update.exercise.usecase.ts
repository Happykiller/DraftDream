// src/usecases/exercise/update.exercise.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapExerciseToUsecase } from '@usecases/exercise/exercise.mapper';
import { UpdateExerciseUsecaseDto } from '@usecases/exercise/exercise.usecase.dto';
import type { ExerciseUsecaseModel } from '@usecases/exercise/exercise.usecase.model';

export class UpdateExerciseUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(id: string, dto: UpdateExerciseUsecaseDto): Promise<ExerciseUsecaseModel> {
    try {
      const { session, ...patch } = dto;

      const exercise = await this.inversify.bddService.exercise.get({ id });
      if (!exercise) {
        throw new Error(ERRORS.EXERCISE_UPDATE_NOT_FOUND);
      }

      const creatorId = typeof exercise.createdBy === 'string' ? exercise.createdBy : exercise.createdBy?.id;
      const isAdmin = session.role === Role.ADMIN;
      const isCreator = creatorId === session.userId;

      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.UPDATE_EXERCISE_FORBIDDEN);
      }

      const res = await this.inversify.bddService.exercise.update(id, patch);
      return mapExerciseToUsecase(res);
    } catch (e: any) {
      if (
        e?.message === ERRORS.UPDATE_EXERCISE_FORBIDDEN ||
        e?.message === ERRORS.EXERCISE_UPDATE_NOT_FOUND
      ) {
        throw e;
      }
      this.inversify.loggerService.error(`UpdateExerciseUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.UPDATE_EXERCISE_USECASE);
    }
  }
}
