// src/usecases/exercise/list.exercises.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { mapExerciseToUsecase } from '@usecases/exercise/exercise.mapper';
import { ListExercisesUsecaseDto } from '@usecases/exercise/exercise.usecase.dto';
import type { ExerciseUsecaseModel } from '@usecases/exercise/exercise.usecase.model';

export class ListExercisesUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: ListExercisesUsecaseDto): Promise<{ items: ExerciseUsecaseModel[]; total: number; page: number; limit: number }> {
    try {
      const { session, ...payload } = dto;

      if (session.role === 'ADMIN') {
        const res = await this.inversify.bddService.exercise.list(payload);
        return {
          items: res.items.map(mapExerciseToUsecase),
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }

      if (session.role === 'COACH') {
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

        if (visibility === 'public') {
          const res = await this.inversify.bddService.exercise.list({
            ...rest,
            visibility: 'public',
          });
          return {
            items: res.items.map(mapExerciseToUsecase),
            total: res.total,
            page: res.page,
            limit: res.limit,
          };
        }

        const effectiveVisibility = visibility === 'private' ? 'private' : undefined;
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
      throw new Error(ERRORS.LIST_EXERCISES_USECASE);
    }
  }
}
