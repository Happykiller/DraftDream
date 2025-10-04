// src/usecases/exercise/list.exercises.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { mapExerciseToUsecase } from '@usecases/exercise/exercise.mapper';
import { ListExercisesUsecaseDto } from '@usecases/exercise/exercise.usecase.dto';
import type { ExerciseUsecaseModel } from '@usecases/exercise/exercise.usecase.model';

export class ListExercisesUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListExercisesUsecaseDto = {}): Promise<{ items: ExerciseUsecaseModel[]; total: number; page: number; limit: number }> {
    try {
      const res = await this.inversify.bddService.exercise.list(dto);
      return {
        items: res.items.map(mapExerciseToUsecase),
        total: res.total,
        page: res.page,
        limit: res.limit,
      };
    } catch (e: any) {
      this.inversify.loggerService.error(`ListExercisesUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.LIST_EXERCISES_USECASE);
    }
  }
}
