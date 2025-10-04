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
      const res = await this.inversify.bddService.exercise.get(dto);
      return res ? mapExerciseToUsecase(res) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`GetExerciseUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.GET_EXERCISE_USECASE);
    }
  }
}
