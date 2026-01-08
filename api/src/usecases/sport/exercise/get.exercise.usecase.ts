// src/usecases/exercise/get.exercise.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { normalizeError } from '@src/common/error.util';
import { mapExerciseToUsecase } from '@src/usecases/sport/exercise/exercise.mapper';
import { GetExerciseUsecaseDto } from '@src/usecases/sport/exercise/exercise.usecase.dto';
import type { ExerciseUsecaseModel } from '@src/usecases/sport/exercise/exercise.usecase.model';

export class GetExerciseUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetExerciseUsecaseDto): Promise<ExerciseUsecaseModel | null> {
    try {
      const { id } = dto;
      const res = await this.inversify.bddService.exercise.get({ id });
      if (!res) {
        return null;
      }

      return mapExerciseToUsecase(res);
    } catch (e: any) {
      this.inversify.loggerService.error(`GetExerciseUsecase#execute (exerciseId: ${dto.id}) => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.GET_EXERCISE_USECASE);
    }
  }
}
