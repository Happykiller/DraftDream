// src/usecases/exercise/get.exercise.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
import { mapExerciseToUsecase } from '@src/usecases/sport/exercise/exercise.mapper';
import { GetExerciseUsecaseDto } from '@src/usecases/sport/exercise/exercise.usecase.dto';
import { enumEquals } from '@src/common/enum.util';
import type { ExerciseUsecaseModel } from '@src/usecases/sport/exercise/exercise.usecase.model';

export class GetExerciseUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetExerciseUsecaseDto): Promise<ExerciseUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      void session;
      const res = await this.inversify.bddService.exercise.get(payload);
      if (!res) {
        return null;
      }



      // Read access is allowed for all roles according to business rules.
      if (session.role === Role.ADMIN || res.createdBy === session.userId || enumEquals(res.visibility, 'PUBLIC')) {
        return mapExerciseToUsecase(res);
      }

      throw new Error(ERRORS.GET_EXERCISE_FORBIDDEN);
    } catch (e: any) {
      if (e?.message === ERRORS.GET_EXERCISE_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`GetExerciseUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.GET_EXERCISE_USECASE);
    }
  }
}
