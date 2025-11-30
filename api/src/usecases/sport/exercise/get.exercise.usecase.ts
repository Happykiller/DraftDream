// src/usecases/exercise/get.exercise.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
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
      const isCreator = creatorId === session.userId;
      const isCoach = session.role === Role.COACH;
      const isPublic = res.visibility === 'public' || res.visibility === 'hybrid';

      if (!isAdmin && !isCreator && !(isCoach && isPublic)) {
        throw new Error(ERRORS.GET_EXERCISE_FORBIDDEN);
      }

      return mapExerciseToUsecase(res);
    } catch (e: any) {
      if (e?.message === ERRORS.GET_EXERCISE_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`GetExerciseUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.GET_EXERCISE_USECASE);
    }
  }
}
