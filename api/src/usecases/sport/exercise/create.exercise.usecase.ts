// src/usecases/exercise/create.exercise.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { buildSlug } from '@src/common/slug.util';
import { mapExerciseToUsecase } from '@src/usecases/sport/exercise/exercise.mapper';
import { CreateExerciseUsecaseDto } from '@src/usecases/sport/exercise/exercise.usecase.dto';
import type { ExerciseUsecaseModel } from '@src/usecases/sport/exercise/exercise.usecase.model';

export class CreateExerciseUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: CreateExerciseUsecaseDto): Promise<ExerciseUsecaseModel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'exercise' });
      const created = await this.inversify.bddService.exercise.create({
        ...dto,
        slug,
      });
      return created ? mapExerciseToUsecase(created) : null;
    } catch (e: any) {
      this.inversify.loggerService.error(`CreateExerciseUsecase#execute => ${e?.message ?? e}`);
      throw new Error(ERRORS.CREATE_EXERCISE_USECASE);
    }
  }
}
