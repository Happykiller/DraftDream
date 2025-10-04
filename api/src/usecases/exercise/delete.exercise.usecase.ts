// src/usecases/exercise/delete.exercise.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';

export class DeleteExerciseUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(id: string): Promise<boolean> {
    try {
      return await this.inversify.bddService.exercise.delete(id);
    } catch (e: any) {
      this.inversify.loggerService.error(`DeleteExerciseUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.DELETE_EXERCISE_USECASE);
    }
  }
}
