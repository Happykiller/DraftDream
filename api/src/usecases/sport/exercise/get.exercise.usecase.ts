// src/usecases/exercise/get.exercise.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { mapExerciseToUsecase } from '@src/usecases/sport/exercise/exercise.mapper';
import { GetExerciseUsecaseDto } from '@src/usecases/sport/exercise/exercise.usecase.dto';
import type { ExerciseUsecaseModel } from '@src/usecases/sport/exercise/exercise.usecase.model';

export class GetExerciseUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: GetExerciseUsecaseDto): Promise<ExerciseUsecaseModel | null> {
    try {
      const { session, ...payload } = dto;
      const res = await this.inversify.bddService.exercise.get(payload);
      if (!res) {
        return null;
      }

      const creatorId = typeof res.createdBy === 'string' ? res.createdBy : res.createdBy?.id;
      const isAdmin = session.role === Role.ADMIN;
      const isPublic = res.visibility === 'PUBLIC';
      const isCreator = creatorId === session.userId;

      if (!isAdmin && !isPublic && !isCreator) {
        throw new Error(ERRORS.GET_EXERCISE_FORBIDDEN);
      }

      return mapExerciseToUsecase(res);
    } catch (e: any) {
      if (e.message === ERRORS.GET_EXERCISE_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`GetExerciseUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.GET_EXERCISE_USECASE);
    }
  }
}
