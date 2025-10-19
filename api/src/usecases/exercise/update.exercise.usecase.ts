// src/usecases/exercise/update.exercise.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { mapExerciseToUsecase } from '@usecases/exercise/exercise.mapper';
import { UpdateExerciseUsecaseDto } from '@usecases/exercise/exercise.usecase.dto';
import type { ExerciseUsecaseModel } from '@usecases/exercise/exercise.usecase.model';

export class UpdateExerciseUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(id: string, patch: UpdateExerciseUsecaseDto): Promise<ExerciseUsecaseModel> {
    try {
      const res = await this.inversify.bddService.exercise.update(id, patch);
      return mapExerciseToUsecase(res);
    } catch (e: any) {
      this.inversify.loggerService.error(`UpdateExerciseUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.UPDATE_EXERCISE_USECASE);
    }
  }
}
