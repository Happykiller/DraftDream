// src/usecases/exercise/list.exercises.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { mapExerciseToUsecase } from '@src/usecases/sport/exercise/exercise.mapper';
import { ListExercisesUsecaseDto } from '@src/usecases/sport/exercise/exercise.usecase.dto';
import type { ExerciseUsecaseModel } from '@src/usecases/sport/exercise/exercise.usecase.model';
import { enumEquals } from '@src/common/enum.util';

export class ListExercisesUsecase {
  constructor(private readonly inversify: Inversify) { }

  async execute(dto: ListExercisesUsecaseDto): Promise<{ items: ExerciseUsecaseModel[]; total: number; page: number; limit: number }> {
    try {
      const { session, ...payload } = dto;

      if (session.role === Role.ADMIN) {
        const res = await this.inversify.bddService.exercise.list(payload);
        return {
          items: res.items.map(mapExerciseToUsecase),
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }

      if (session.role === Role.COACH) {
        const { createdBy, visibility, ...rest } = payload;

        if (createdBy) {
          if (createdBy !== session.userId) {
            throw new Error(ERRORS.LIST_EXERCISES_FORBIDDEN);
          }
          const res = await this.inversify.bddService.exercise.list({
            ...rest,
            createdBy: session.userId,
            visibility,
          });
          return {
            items: res.items.map(mapExerciseToUsecase),
            total: res.total,
            page: res.page,
            limit: res.limit,
          };
        }

        if (enumEquals(visibility, 'PUBLIC')) {
          const res = await this.inversify.bddService.exercise.list({
            ...rest,
            visibility: 'PUBLIC',
          });
          return {
            items: res.items.map(mapExerciseToUsecase),
            total: res.total,
            page: res.page,
            limit: res.limit,
          };
        }

        const effectiveVisibility = enumEquals(visibility, 'PRIVATE') ? 'PRIVATE' : undefined;
        const res = await this.inversify.bddService.exercise.list({
          ...rest,
          ...(effectiveVisibility ? { visibility: effectiveVisibility } : {}),
          createdByIn: [session.userId],
          includePublicVisibility: !effectiveVisibility,
        });
        return {
          items: res.items.map(mapExerciseToUsecase),
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }

      throw new Error(ERRORS.LIST_EXERCISES_FORBIDDEN);
    } catch (e: any) {
      if (e?.message === ERRORS.LIST_EXERCISES_FORBIDDEN) {
        throw e;
      }
      this.inversify.loggerService.error(`ListExercisesUsecase#execute => ${e?.message ?? e}`);
      throw normalizeError(e, ERRORS.LIST_EXERCISES_USECASE);
    }
  }
}
