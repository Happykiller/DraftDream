// src/usecases/exercise/get.exercise.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { mapExerciseToUsecase } from '@usecases/exercise/exercise.mapper';
import { GetExerciseUsecaseDto } from '@usecases/exercise/exercise.usecase.dto';
import type { ExerciseUsecaseModel } from '@usecases/exercise/exercise.usecase.model';

export class GetExerciseUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: GetExerciseUsecaseDto): Promise<ExerciseUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const res = await this.inversify.bddService.exercise.get(payload);
      if (!res) {
        return null;
      }

      const creatorId = typeof res.createdBy === 'string' ? res.createdBy : res.createdBy?.id;
      const isAdmin = session.role === 'ADMIN';
      const isCreator = creatorId === session.userId;

      if (!isAdmin && !isCreator) {
        throw new Error(ERRORS.GET_EXERCISE_FORBIDDEN);
      }

      return mapExerciseToUsecase(res);
    } catch (e: any) {
      if (e?.message === ERRORS.GET_EXERCISE_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`GetExerciseUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.GET_EXERCISE_USECASE);
    }
  }
}
